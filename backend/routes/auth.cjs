const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db.cjs");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Find company by email
    const [rows] = await pool.query(
      "SELECT id, client_code, company_name, email, password_hash FROM companies WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const company = rows[0];

    // 2) Compare password
    const isMatch = await bcrypt.compare(password, company.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3) Return success + all needed fields
    res.json({
      message:      "Login successful",
      company_id:   company.id,           // <— numeric ID
      clientCode:   company.client_code,
      companyName:  company.company_name,
      email:        company.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
