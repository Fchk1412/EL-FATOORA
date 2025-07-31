const express = require("express");
const pool = require("../db.cjs");

const router = express.Router();

/**
 * Helper: Get company ID from client code
 */
async function getCompanyId(clientCode) {
  const [rows] = await pool.query("SELECT id FROM companies WHERE client_code = ?", [clientCode]);
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Get all products for a company
 */
router.get("/products/:clientCode", async (req, res) => {
  try {
    const companyId = await getCompanyId(req.params.clientCode);
    if (!companyId) return res.status(404).json({ error: "Company not found" });

    const [rows] = await pool.query("SELECT * FROM products WHERE company_id = ?", [companyId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Add new product
 */
router.post("/products/add", async (req, res) => {
  try {
    const { product_name, product_code, price, tax_rate, company_id } = req.body;

    const companyId = await getCompanyId(company_id);
    if (!companyId) return res.status(404).json({ error: "Company not found" });

    await pool.query(
      "INSERT INTO products (company_id, product_name, product_code, tax_rate, price) VALUES (?, ?, ?, ?, ?)",
      [companyId, product_name, product_code, tax_rate, price]
    );

    res.json({ message: "Product added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Update product
 */
router.put("/products/update/:id", async (req, res) => {
  try {
    const { product_name, product_code, price, tax_rate } = req.body;
    const { id } = req.params;

    await pool.query(
      "UPDATE products SET product_name = ?, product_code = ?, price = ?, tax_rate = ? WHERE id = ?",
      [product_name, product_code, price, tax_rate, id]
    );

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Delete product
 */
router.delete("/products/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM products WHERE id = ?", [id]);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
