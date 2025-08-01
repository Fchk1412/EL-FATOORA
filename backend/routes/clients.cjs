const express = require("express");
const pool = require("../db.cjs");
const router = express.Router();

// Generate a unique 8-digit client_code within a company
async function generateClientCode(companyId) {
  let code, rows;
  do {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    [rows] = await pool.query(
      "SELECT id FROM clients WHERE company_id = ? AND client_code = ?",
      [companyId, code]
    );
  } while (rows.length);
  return code;
}

// GET all clients for a company
router.get("/clients/:companyId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM clients WHERE company_id = ?",
      [req.params.companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD a client
router.post("/clients/add", async (req, res) => {
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
      client_code && client_code.trim()
        ? client_code
        : await generateClientCode(company_id);

    const fiscalId =
      matricule_fiscal && matricule_fiscal.trim()
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

    res.json({ message: "Client added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE a client
router.put("/clients/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
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

    await pool.query(
      `UPDATE clients
         SET client_code = ?, name = ?, matricule_fiscal = ?, email = ?, street = ?, city = ?, postal_code = ?, country = ?, phone = ?
       WHERE id = ?`,
      [
        client_code,
        name,
        matricule_fiscal,
        email,
        street,
        city,
        postal_code,
        country,
        phone,
        id,
      ]
    );

    res.json({ message: "Client updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a client  
router.delete("/clients/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM clients WHERE id = ?", [req.params.id]);
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
