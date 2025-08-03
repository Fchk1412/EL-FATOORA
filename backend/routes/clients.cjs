const express = require("express");
const pool = require("../db.cjs");
const router = express.Router();

// Generate unique 8-digit code within a company
async function generateClientCode(companyId) {
  let code, exists;
  do {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const [rows] = await pool.query(
      "SELECT id FROM clients WHERE company_id = ? AND client_code = ?",
      [companyId, code]
    );
    exists = rows.length > 0;
  } while (exists);
  return code;
}

// Create client
router.post("/clients", async (req, res) => {
  try {
    const {
      company_id,
      client_code,
      name,
      matricule_fiscal,
      email,
      street,
      city,
      postal_code,
      country,
      phone,
    } = req.body;

    if (!company_id) {
      return res.status(400).json({ error: "Missing company_id" });
    }

    const finalCode =
      client_code && client_code.trim() !== ""
        ? client_code
        : await generateClientCode(company_id);

    const fiscalId =
      matricule_fiscal && matricule_fiscal.trim() !== ""
        ? matricule_fiscal
        : "999999999";

    await pool.query(
      `INSERT INTO clients
        (company_id, client_code, name, matricule_fiscal, email, street, city, postal_code, country, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        finalCode,
        name,
        fiscalId,
        email,
        street,
        city,
        postal_code,
        country,
        phone,
      ]
    );

    res.json({ message: "Client added" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get clients by numeric company_id
router.get("/clients/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId, 10);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company_id" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM clients WHERE company_id = ?",
      [companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
