import express from "express";
import productController from "../controllers/productController.js";

const router = express.Router();

// GET /api/products/company/:companyId
router.get(
  "/products/company/:companyId",
  productController.getProductsByCompany
);

// POST /api/products
router.post("/products", productController.createProduct);

// PUT /api/products/:id
router.put("/products/:id", productController.updateProduct);

// DELETE /api/products/:id
router.delete("/products/:id", productController.deleteProduct);

export default router;
