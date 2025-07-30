import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route: Generate invoice PDF
app.post("/api/generate-invoice", async (req, res) => {
  const data = req.body;

  // Load HTML template
  let html = fs.readFileSync(path.join(process.cwd(), "backend/invoice-template.html"), "utf-8");

  // Replace placeholders
  html = html
    .replace(/{{invoiceNumber}}/g, data.invoiceNumber)
    .replace(/{{issueDate}}/g, data.issueDate)
    .replace(/{{clientName}}/g, data.client.name)
    .replace(/{{clientTVA}}/g, data.client.tva)
    .replace(/{{total}}/g, data.totals.grandTotal);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
