import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to format numbers to 3 decimal places
function formatAmount(amount) {
  return Number(amount).toFixed(3);
}

// Helper function to format tax rate to 2 decimal places
function formatTaxRate(rate) {
  return Number(rate).toFixed(2);
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Generate HTML template that matches the TTN invoice layout
function generateInvoiceHTML(invoiceData) {
  const { invoice, items } = invoiceData;

  // Calculate subtotals
  let totalExclTax = 0;
  let totalTax = 0;

  const itemsHTML = items
    .map((item, index) => {
      const lineTotal = Number(item.amount_excl_tax);
      const taxAmount = lineTotal * (Number(item.tax_rate) / 100);
      totalExclTax += lineTotal;
      totalTax += taxAmount;

      return `
      <tr>
        <td class="border border-gray-400 px-2 py-1 text-sm">${
          item.product_code || ""
        }</td>
        <td class="border border-gray-400 px-2 py-1 text-sm">${
          item.product_name || ""
        }</td>
        <td class="border border-gray-400 px-2 py-1 text-sm text-center">${formatAmount(
          item.quantity
        )}</td>
        <td class="border border-gray-400 px-2 py-1 text-sm text-center">${formatTaxRate(
          item.tax_rate
        )}%</td>
        <td class="border border-gray-400 px-2 py-1 text-sm text-right">${formatAmount(
          item.unit_price
        )}</td>
        <td class="border border-gray-400 px-2 py-1 text-sm text-right">${formatAmount(
          lineTotal
        )}</td>
      </tr>
    `;
    })
    .join("");

  const totalAmount = totalExclTax + totalTax;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoice.invoice_number}</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.2;
            margin: 0;
            padding: 0;
            color: #000;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        
        .logo-section {
            flex: 1;
        }
        
        .logo-section h1 {
            color: #d32f2f;
            font-size: 18pt;
            margin: 0;
            font-weight: bold;
        }
        
        .logo-section .subtitle {
            color: #666;
            font-size: 9pt;
            margin: 2px 0;
        }
        
        .contact-info {
            flex: 2;
            text-align: center;
            font-size: 8pt;
            line-height: 1.1;
        }
        
        .arabic-section {
            flex: 1;
            text-align: right;
            font-size: 8pt;
            direction: rtl;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
        }
        
        .invoice-info {
            flex: 1;
        }
        
        .invoice-info table {
            border-collapse: collapse;
            width: 100%;
        }
        
        .invoice-info td {
            padding: 3px 5px;
            border: 1px solid #666;
            font-size: 9pt;
        }
        
        .company-client-info {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            gap: 20px;
        }
        
        .company-box, .client-box {
            flex: 1;
            border: 2px solid #d32f2f;
            padding: 10px;
            min-height: 120px;
        }
        
        .box-title {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 9pt;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .details-table th {
            background-color: #f5f5f5;
            border: 1px solid #666;
            padding: 5px;
            text-align: center;
            font-size: 9pt;
            font-weight: bold;
        }
        
        .details-table td {
            border: 1px solid #666;
            padding: 5px;
            font-size: 9pt;
        }
        
        .totals-section {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            gap: 20px;
        }
        
        .tax-table, .total-table {
            border-collapse: collapse;
        }
        
        .tax-table {
            width: 300px;
        }
        
        .total-table {
            width: 250px;
        }
        
        .tax-table th, .tax-table td,
        .total-table th, .total-table td {
            border: 1px solid #666;
            padding: 5px;
            text-align: center;
            font-size: 9pt;
        }
        
        .tax-table th, .total-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .footer-note {
            margin: 20px 0;
            font-size: 8pt;
            font-style: italic;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }
        
        .signature-box {
            width: 45%;
            text-align: center;
        }
        
        .signature-box .title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 9pt;
        }
        
        .signature-box .subtitle {
            font-size: 8pt;
            color: #666;
            margin-bottom: 10px;
        }
        
        .signature-area {
            border: 1px solid #ccc;
            height: 60px;
            margin-bottom: 10px;
        }
        
        .reference-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .reference-table th, .reference-table td {
            border: 1px solid #666;
            padding: 3px;
            text-align: center;
            font-size: 8pt;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .font-bold {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        <div class="logo-section">
            <h1>T.T.N</h1>
            <div class="subtitle">TUNISIE TRADENET</div>
        </div>
        
        <div class="contact-info">
            <div>Adresse: Rue du Lac Malaren, Lotissement El Khalij Les Berges du</div>
            <div>Lac, 1053-Tunis - Tunisie</div>
            <div>Téléphone: 71 86 17 12</div>
            <div>Télécopie: 71 86 11 41</div>
            <div>Site Web: www.tradenet.com.tn</div>
        </div>
        
        <div class="arabic-section">
            <div>العنوان</div>
            <div>رقم الهاتف</div>
            <div>رقم الفاكس</div>
            <div>موقع الإنترنت</div>
        </div>
    </div>

    <!-- Invoice Info -->
    <div class="invoice-header">
        <div class="invoice-info">
            <table>
                <tr>
                    <td class="font-bold">Facture N°</td>
                    <td>${invoice.invoice_number || ""}</td>
                    <td class="font-bold">فاتورة رقم</td>
                </tr>
                <tr>
                    <td class="font-bold">Date</td>
                    <td>${formatDate(invoice.invoice_date)}</td>
                    <td class="font-bold">التاريخ</td>
                </tr>
                <tr>
                    <td class="font-bold">Période du</td>
                    <td>${
                      invoice.service_period_start
                        ? formatDate(invoice.service_period_start)
                        : ""
                    }</td>
                    <td class="font-bold">المدة</td>
                </tr>
                <tr>
                    <td class="font-bold">Au</td>
                    <td>${
                      invoice.service_period_end
                        ? formatDate(invoice.service_period_end)
                        : ""
                    }</td>
                    <td class="font-bold">إلى</td>
                </tr>
                <tr>
                    <td class="font-bold">Référence Unique</td>
                    <td>${invoice.reference_unique || ""}</td>
                    <td class="font-bold">المرجع الوحيد</td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Company and Client Information -->
    <div class="company-client-info">
        <div class="company-box">
            <div class="box-title">Nom Compagnie :</div>
            <div>${invoice.company_name || ""}</div>
            <div class="box-title" style="margin-top: 8px;">Mode de connexion :</div>
            <div class="box-title" style="margin-top: 8px;">Rang du compte :</div>
            <div class="box-title" style="margin-top: 8px;">Profil :</div>
            <div class="box-title" style="margin-top: 8px;">Pays Client :</div>
            <div class="box-title" style="margin-top: 8px;">Matricule Fiscal :</div>
            <div>${invoice.company_client_code || ""}</div>
            <div class="box-title" style="margin-top: 8px;">Date Limite de paiement :</div>
            <div>${formatDate(invoice.due_date)}</div>
        </div>
        
        <div class="client-box">
            <div class="box-title">Client Information:</div>
            <div class="font-bold">${invoice.client_name || ""}</div>
            <div style="margin-top: 5px;">${invoice.client_address || ""}</div>
            <div>${invoice.client_city || ""} ${
    invoice.client_postal_code || ""
  }</div>
            <div style="margin-top: 8px;">
                <span class="font-bold">Matricule Fiscal:</span> ${
                  invoice.client_tax_number || ""
                }
            </div>
        </div>
    </div>

    <!-- Table Header -->
    <div style="margin: 15px 0; font-size: 9pt; font-style: italic;">
        Copie de la facture électronique enregistrée chez TTN sous la référence :
    </div>

    <!-- Details Table -->
    <table class="details-table">
        <thead>
            <tr>
                <th>Code</th>
                <th>Désignation</th>
                <th>Quantité</th>
                <th>T.V.A %</th>
                <th>P.U.H.T.V.A</th>
                <th>Total H.T.V.A</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHTML}
        </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-section">
        <div>
            <table class="tax-table">
                <thead>
                    <tr>
                        <th>Taux (%)</th>
                        <th>Base</th>
                        <th>Montant TVA</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${formatTaxRate(items[0]?.tax_rate || 19)}</td>
                        <td>${formatAmount(totalExclTax)}</td>
                        <td>${formatAmount(totalTax)}</td>
                    </tr>
                    <tr>
                        <td class="font-bold">Total</td>
                        <td class="font-bold">${formatAmount(totalExclTax)}</td>
                        <td class="font-bold">${formatAmount(totalTax)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div>
            <table class="total-table">
                <tbody>
                    <tr>
                        <td class="font-bold">Total H.T.V.A</td>
                        <td class="text-right">${formatAmount(
                          totalExclTax
                        )}</td>
                    </tr>
                    <tr>
                        <td class="font-bold">Montant TVA</td>
                        <td class="text-right">${formatAmount(totalTax)}</td>
                    </tr>
                    <tr>
                        <td class="font-bold">Droit de Timbre</td>
                        <td class="text-right">${formatAmount(
                          invoice.stamp_duty || 0
                        )}</td>
                    </tr>
                    <tr>
                        <td class="font-bold">Montant T.T.C</td>
                        <td class="text-right font-bold">${formatAmount(
                          totalAmount + Number(invoice.stamp_duty || 0)
                        )}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Footer Note -->
    <div class="footer-note">
        Arrêté la présente facture, sauf erreur ou omission de notre part, à la somme de :
    </div>
    <div style="border: 1px solid #666; padding: 10px; margin: 10px 0; min-height: 20px;">
        ${invoice.total_amount_words || ""}
    </div>
    <div style="font-size: 8pt; font-style: italic; margin: 10px 0;">
        * À Régler exclusivement au niveau des bureaux postaux qui présentent de la facture.
    </div>

    <!-- Signature Section -->
    <div class="signature-section">
        <div class="signature-box">
            <div class="title">البريد</div>
            <div class="subtitle">Poste</div>
            <div class="subtitle">Coupon de Versement CCP</div>
            <div class="signature-area"></div>
            <div style="font-weight: bold;">رقم الإصدار</div>
            <div style="border: 1px solid #666; height: 30px; margin: 5px 0;"></div>
            <div style="font-size: 8pt;">N° d'émission</div>
        </div>
        
        <div class="signature-box">
            <div class="title">البريد</div>
            <div class="subtitle">Poste</div>
            <div class="subtitle">Bulletin de Versement CCP</div>
            <div class="signature-area"></div>
            <div style="font-weight: bold;">رقم الإصدار</div>
            <div style="border: 1px solid #666; height: 30px; margin: 5px 0;"></div>
            <div style="font-size: 8pt;">N° d'émission</div>
        </div>
    </div>

    <!-- Reference Tables -->
    <table class="reference-table">
        <thead>
            <tr>
                <th>ر.خ</th>
                <th>المبلغ</th>
                <th>المرجع</th>
                <th>الطابع</th>
                <th>ر.خ</th>
                <th>المبلغ</th>
                <th>المرجع</th>
                <th>الطابع</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Code org</td>
                <td>Montant</td>
                <td>Référence</td>
                <td>Clés</td>
                <td>Code org</td>
                <td>Montant</td>
                <td>Référence</td>
                <td>Clés</td>
            </tr>
        </tbody>
    </table>

</body>
</html>
  `;
}

// Generate PDF from invoice data
export async function generateInvoicePDF(invoiceData, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set page format to A4
    await page.setViewport({ width: 794, height: 1123 });

    // Generate HTML content
    const htmlContent = generateInvoiceHTML(invoiceData);

    // Set HTML content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    // Save PDF to file if outputPath is provided
    if (outputPath) {
      fs.writeFileSync(outputPath, pdfBuffer);
    }

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

// Helper function to get invoice data for PDF generation
export async function generateInvoicePDFById(invoiceId, outputPath) {
  // This would typically fetch data from database
  // For now, we'll use the same helper from xmlGenerator
  const { getInvoiceDataForXML } = await import("./invoiceController.js");

  try {
    const invoiceData = await getInvoiceDataForXML(invoiceId);
    if (!invoiceData) {
      throw new Error("Invoice not found");
    }

    return await generateInvoicePDF(invoiceData, outputPath);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
