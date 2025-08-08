import pool from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateInvoiceXML } from "./xmlGenerator.js";
import { generateInvoicePDF } from "./pdfGenerator.js";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Get full invoice data for XML generation
export async function getInvoiceDataForXML(invoiceId) {
  // Get invoice with company and client data
  const invoiceResult = await pool.query(
    `
    SELECT i.*, 
           c.company_name, c.matricule_fiscal as company_client_code,
           cl.name as client_name, cl.street as client_address, cl.city as client_city,
           cl.postal_code as client_postal_code, cl.matricule_fiscal as client_tax_number
    FROM invoices i
    JOIN companies c ON i.company_id = c.id
    JOIN clients cl ON i.client_id = cl.id
    WHERE i.id = $1
  `,
    [invoiceId]
  );

  if (invoiceResult.rows.length === 0) return null;

  const invoice = invoiceResult.rows[0];

  // Get invoice items with product details
  const itemsResult = await pool.query(
    `
    SELECT ii.*, p.product_name, p.product_code
    FROM invoice_items ii
    JOIN products p ON ii.product_id = p.id
    WHERE ii.invoice_id = $1
  `,
    [invoiceId]
  );

  return { invoice, items: itemsResult.rows };
}

const invoiceController = {
  // Get all invoices for a company
  getInvoicesByCompany: async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (!companyId || isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid company_id" });
      }

      const result = await pool.query(
        `SELECT i.*, c.name AS client_name 
         FROM invoices i
         JOIN clients c ON i.client_id = c.id
         WHERE i.company_id = $1
         ORDER BY i.created_at DESC`,
        [companyId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Get invoices error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Create new invoice with items and generate XML
  createInvoice: async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        company_id,
        client_id,
        invoice_number,
        document_type,
        invoice_date,
        service_period_start,
        service_period_end,
        due_date,
        payment_terms,
        payment_rib,
        stamp_duty,
        items,
      } = req.body;

      const companyId = parseInt(company_id, 10);
      if (!companyId || isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid company_id" });
      }

      await client.query("BEGIN");

      // Calculate totals
      let totalExcl = 0,
        totalIncl = 0,
        totalTax = 0;

      items.forEach((item) => {
        const excl = item.quantity * item.unit_price;
        const tax = (excl * item.tax_rate) / 100;
        totalExcl += excl;
        totalTax += tax;
        totalIncl += excl + tax;
      });

      // Insert invoice
      const invoiceResult = await client.query(
        `INSERT INTO invoices 
          (company_id, client_id, invoice_number, document_type, invoice_date, 
           service_period_start, service_period_end, due_date, 
           payment_terms, payment_rib, stamp_duty, 
           total_excl_tax, total_incl_tax, total_tax, total_amount, total_amount_words)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING id`,
        [
          companyId,
          client_id,
          invoice_number,
          document_type,
          invoice_date,
          service_period_start,
          service_period_end,
          due_date,
          payment_terms,
          payment_rib,
          stamp_duty,
          totalExcl,
          totalIncl,
          totalTax,
          totalIncl,
          "",
        ]
      );

      const invoiceId = invoiceResult.rows[0].id;

      // Insert items with calculated amounts
      for (const item of items) {
        const excl = item.quantity * item.unit_price;
        const tax = (excl * item.tax_rate) / 100;
        const incl = excl + tax;

        await client.query(
          `INSERT INTO invoice_items 
           (invoice_id, product_id, quantity, unit_price, tax_rate, 
            amount_excl_tax, amount_incl_tax, tax_amount)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            invoiceId,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.tax_rate,
            excl,
            incl,
            tax,
          ]
        );
      }

      await client.query("COMMIT");

      // Generate XML file using the improved XML generator
      try {
        const invoiceData = await getInvoiceDataForXML(invoiceId);
        if (invoiceData) {
          const xmlContent = generateInvoiceXML(invoiceData);

          // Create invoices directory if it doesn't exist
          const invoicesDir = path.join(__dirname, "../invoices");
          if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
          }

          // Save XML file
          const xmlFilePath = path.join(
            invoicesDir,
            `invoice_${invoiceId}.xml`
          );
          fs.writeFileSync(xmlFilePath, xmlContent);

          console.log(`✅ XML file generated: ${xmlFilePath}`);

          res.json({
            message: "Invoice created successfully",
            invoiceId,
            xmlGenerated: true,
            xmlPath: xmlFilePath,
          });
        } else {
          res.json({
            message: "Invoice created successfully",
            invoiceId,
            xmlGenerated: false,
            error: "Could not retrieve invoice data for XML generation",
          });
        }
      } catch (xmlError) {
        console.error("XML generation error:", xmlError);
        res.json({
          message: "Invoice created successfully",
          invoiceId,
          xmlGenerated: false,
          xmlError: xmlError.message,
        });
      }
    } catch (err) {
      console.error("Create invoice error:", err);
      await client.query("ROLLBACK");
      res.status(500).json({ error: "Server error" });
    } finally {
      client.release();
    }
  },

  // Get invoice XML by ID
  getInvoiceXML: async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const xmlFilePath = path.join(
        __dirname,
        `../invoices/invoice_${invoiceId}.xml`
      );

      if (!fs.existsSync(xmlFilePath)) {
        return res.status(404).json({ error: "XML file not found" });
      }

      res.setHeader("Content-Type", "application/xml");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoice_${invoiceId}.xml"`
      );
      res.sendFile(path.resolve(xmlFilePath));
    } catch (err) {
      console.error("Get XML error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Delete invoice
  deleteInvoice: async (req, res) => {
    try {
      await pool.query("DELETE FROM invoices WHERE id = $1", [req.params.id]);

      // Also try to delete the XML file
      const xmlFilePath = path.join(
        __dirname,
        `../invoices/invoice_${req.params.id}.xml`
      );
      if (fs.existsSync(xmlFilePath)) {
        fs.unlinkSync(xmlFilePath);
      }

      res.json({ message: "Invoice deleted successfully" });
    } catch (err) {
      console.error("Delete invoice error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Generate PDF for invoice
  generatePDF: async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      if (!invoiceId || isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      // Get invoice data
      const invoiceData = await getInvoiceDataForXML(invoiceId);
      if (!invoiceData) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Generate PDF
      const pdfBuffer = await generateInvoicePDF(invoiceData);

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="facture_${invoiceData.invoice.invoice_number}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (err) {
      console.error("Generate PDF error:", err);
      res.status(500).json({ error: "Error generating PDF" });
    }
  },

  // Preview PDF in browser
  previewPDF: async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      if (!invoiceId || isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      // Get invoice data
      const invoiceData = await getInvoiceDataForXML(invoiceId);
      if (!invoiceData) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Generate PDF
      const pdfBuffer = await generateInvoicePDF(invoiceData);

      // Set response headers for PDF preview
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="facture_${invoiceData.invoice.invoice_number}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (err) {
      console.error("Preview PDF error:", err);
      res.status(500).json({ error: "Error generating PDF preview" });
    }
  },
};

export default invoiceController;
