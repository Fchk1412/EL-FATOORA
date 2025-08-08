import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import subscriptionRoute from "./routes/subscribe.js";
import authRoute from "./routes/auth.js";
import productsRoute from "./routes/products.js";
import clientsRoute from "./routes/clients.js";
import invoicesRoute from "./routes/invoices.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API Routes with consistent /api prefix
app.use("/api", subscriptionRoute);
app.use("/api", authRoute);
app.use("/api", productsRoute);
app.use("/api", clientsRoute);
app.use("/api", invoicesRoute);

// ✅ Invoice generation
const imagePath = path.join(__dirname, "invoice templet.jpg");
const imageBuffer = fs.readFileSync(imagePath);
const imageBase64 = imageBuffer.toString("base64");
const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;

app.post("/api/generate-invoice", async (req, res) => {
  const data = req.body;

  let html = fs.readFileSync(
    path.join(__dirname, "invoice-template.html"),
    "utf8"
  );

  html = html
    .replace("{{templatePath}}", imageDataUri)
    .replace(/{{invoiceNumber}}/g, data.invoiceNumber)
    .replace(/{{issueDate}}/g, data.issueDate)
    .replace(/{{clientName}}/g, data.client.name)
    .replace(/{{clientTVA}}/g, data.client.tva)
    .replace(/{{total}}/g, data.totals.grandTotal);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
});

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
