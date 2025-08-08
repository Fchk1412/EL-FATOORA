import bcrypt from "bcrypt";
import pool from "../db.js";

const authController = {
  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find company by email (using PostgreSQL syntax)
      const result = await pool.query(
        "SELECT id, client_code, company_name, email, password_hash FROM companies WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const company = result.rows[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, company.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Return success response
      res.json({
        message: "Login successful",
        company_id: company.id,
        clientCode: company.client_code,
        companyName: company.company_name,
        email: company.email,
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};

export default authController;
