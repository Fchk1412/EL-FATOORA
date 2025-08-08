import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/login
router.post("/auth/login", authController.login);

export default router;
