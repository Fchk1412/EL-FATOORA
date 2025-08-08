import express from "express";
import clientController from "../controllers/clientController.js";

const router = express.Router();

// GET /api/clients/company/:companyId
router.get("/clients/company/:companyId", clientController.getClientsByCompany);

// POST /api/clients
router.post("/clients", clientController.createClient);

// PUT /api/clients/:id
router.put("/clients/:id", clientController.updateClient);

// DELETE /api/clients/:id
router.delete("/clients/:id", clientController.deleteClient);

export default router;
