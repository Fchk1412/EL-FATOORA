import express from "express";
import subscriptionController from "../controllers/subscriptionController.js";

const router = express.Router();

// POST /api/subscription
router.post("/subscription", subscriptionController.subscribe);

export default router;
