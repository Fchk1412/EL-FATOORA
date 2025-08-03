const express = require("express");
const pool = require("../db.cjs");

const router = express.Router();

// 🔹 Helper: Get company_id from clientCode
async function getCompanyId(clientCode) {
  const [rows] = await pool.query("SELECT id FROM companies WHERE client_code = ?", [clientCode]);
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Get all invoices for a company
 */
router.get("/invoices/:clientCode", async (req, res) => {
  try {
    const companyId = await getCompanyId(req.params.clientCode);
    if (!companyId) return res.status(404).json({ error: "Company not found" });

    const [rows] = await pool.query(
      `SELECT i.*, c.name AS client_name 
       FROM invoices i
       JOIN clients c ON i.client_id = c.id
       WHERE i.company_id = ?`,
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Add new invoice with items
 */
router.post("/invoices/add", async (req, res) => {
  const connection = await pool.getConnection();
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
      items // [{product_id, quantity, unit_price, tax_rate}]
    } = req.body;

    const companyId = await getCompanyId(company_id);
    if (!companyId) return res.status(404).json({ error: "Company not found" });

    await connection.beginTransaction();

    // Calculate totals
    let totalExcl = 0, totalIncl = 0, totalTax = 0;

    items.forEach(item => {
      const excl = item.quantity * item.unit_price;
      const tax = (excl * item.tax_rate) / 100;
      totalExcl += excl;
      totalTax += tax;
      totalIncl += excl + tax;
    });

    // Insert invoice
    const [result] = await connection.query(
      `INSERT INTO invoices 
        (company_id, client_id, invoice_number, document_type, invoice_date, 
         service_period_start, service_period_end, due_date, 
         payment_terms, payment_rib, stamp_duty, 
         total_excl_tax, total_incl_tax, total_tax, total_amount, total_amount_words)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId, client_id, invoice_number, document_type, invoice_date,
        service_period_start, service_period_end, due_date,
        payment_terms, payment_rib, stamp_duty,
        totalExcl, totalIncl, totalTax, totalIncl, "", // amount words can be generated later
      ]
    );

    const invoiceId = result.insertId;

    // Insert items
    for (const item of items) {
      const excl = item.quantity * item.unit_price;
      const tax = (excl * item.tax_rate) / 100;
      const incl = excl + tax;

      await connection.query(
        `INSERT INTO invoice_items
          (invoice_id, product_id, quantity, unit_price, tax_rate, 
           amount_excl_tax, amount_incl_tax, tax_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.product_id, item.quantity, item.unit_price, item.tax_rate,
         excl, incl, tax]
      );
    }

    await connection.commit();
    res.json({ message: "Invoice added successfully" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    connection.release();
  }
});

/**
 * Delete invoice
 */
router.delete("/invoices/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM invoices WHERE id = ?", [req.params.id]);
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
