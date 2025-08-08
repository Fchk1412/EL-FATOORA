import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import database connection and initialization
import pool from "./db.js";
import initializeDatabase from "./initDb.js";

// Import routes
import subscriptionRoute from "./routes/subscribe.js";
import authRoute from "./routes/auth.js";
import productsRoute from "./routes/products.js";
import clientsRoute from "./routes/clients.js";
import invoicesRoute from "./routes/invoices.js";

const app = express();

// Production-ready CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL || "https://your-app.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(bodyParser.json());

// API Routes with consistent /api prefix
app.use("/api", subscriptionRoute);
app.use("/api", authRoute);
app.use("/api", productsRoute);
app.use("/api", clientsRoute);
app.use("/api", invoicesRoute);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV,
      server: "running",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      environment: process.env.NODE_ENV,
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "ElFatoura API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      auth: "/api/login",
      clients: "/api/clients/company/:id",
      products: "/api/products/company/:id",
      invoices: "/api/invoices/company/:id",
    },
  });
});

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

  const browser = await puppeteer.launch({
    headless: "new",
    args:
      process.env.NODE_ENV === "production"
        ? [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
          ]
        : [],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
});

// Production-ready server startup
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    console.log("🔌 Testing database connection...");
    const client = await pool.connect();
    console.log("✅ Database connection successful");
    client.release();

    // Initialize database schema and sample data
    await initializeDatabase();
    console.log("✅ Database initialization complete");

    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    console.error(
      "DATABASE_URL:",
      process.env.DATABASE_URL ? "Set" : "Not set"
    );

    // In production, don't exit but log the error
    if (process.env.NODE_ENV !== "production") {
      console.error("Exiting due to database connection failure...");
      process.exit(1);
    }
    return false;
  }
}

app.listen(PORT, async () => {
  console.log(`✅ ElFatoura Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);

  // Test database connection
  await testDatabaseConnection();
});
