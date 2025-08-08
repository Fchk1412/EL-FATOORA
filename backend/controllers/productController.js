import pool from "../db.js";

const productController = {
  // Get all products for a company
  getProductsByCompany: async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid company_id" });
      }

      const result = await pool.query(
        "SELECT * FROM products WHERE company_id = $1 ORDER BY created_at DESC",
        [companyId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Get products error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    try {
      const { product_name, product_code, price, tax_rate, company_id } =
        req.body;

      if (!company_id) {
        return res.status(400).json({ error: "Missing company_id" });
      }

      await pool.query(
        "INSERT INTO products (company_id, product_name, product_code, tax_rate, price) VALUES ($1, $2, $3, $4, $5)",
        [company_id, product_name, product_code, tax_rate, price]
      );

      res.json({ message: "Product created successfully" });
    } catch (err) {
      console.error("Create product error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { product_name, product_code, price, tax_rate } = req.body;
      const { id } = req.params;

      await pool.query(
        "UPDATE products SET product_name = $1, product_code = $2, price = $3, tax_rate = $4 WHERE id = $5",
        [product_name, product_code, price, tax_rate, id]
      );

      res.json({ message: "Product updated successfully" });
    } catch (err) {
      console.error("Update product error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      await pool.query("DELETE FROM products WHERE id = $1", [id]);

      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error("Delete product error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};

export default productController;
