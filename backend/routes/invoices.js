import express from "express";
import invoiceController from "../controllers/invoiceController.js";

const router = express.Router();

// GET /api/invoices/company/:companyId
router.get(
  "/invoices/company/:companyId",
  invoiceController.getInvoicesByCompany
);

// POST /api/invoices
router.post("/invoices", invoiceController.createInvoice);

// GET /api/invoices/:id/xml
router.get("/invoices/:id/xml", invoiceController.getInvoiceXML);

// GET /api/invoices/:id/pdf
router.get("/invoices/:id/pdf", invoiceController.generatePDF);

// GET /api/invoices/:id/preview
router.get("/invoices/:id/preview", invoiceController.previewPDF);

// DELETE /api/invoices/:id
router.delete("/invoices/:id", invoiceController.deleteInvoice);

export default router;
