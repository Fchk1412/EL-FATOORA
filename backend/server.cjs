const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const subscribeRoute = require("./routes/subscribe.cjs");
const authRoute = require("./routes/auth.cjs");
const productsRoute = require("./routes/products.cjs");
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Subscription route
app.use("/api", subscribeRoute);
// ✅ Authentication route
app.use("/api", authRoute);
// ✅ Products route
app.use("/api", productsRoute);

// ✅ Invoice generation
const imagePath = path.join(__dirname, "invoice templet.jpg");
const imageBuffer = fs.readFileSync(imagePath);
const imageBase64 = imageBuffer.toString("base64");
const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;

app.post("/api/generate-invoice", async (req, res) => {
  const data = req.body;

  let html = fs.readFileSync(path.join(__dirname, "invoice-template.html"), "utf8");

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

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
