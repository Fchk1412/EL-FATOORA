import pool from "../db.js";

// Generate unique 8-digit code within a company
async function generateClientCode(companyId) {
  let code, exists;
  do {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const result = await pool.query(
      "SELECT id FROM clients WHERE company_id = $1 AND client_code = $2",
      [companyId, code]
    );
    exists = result.rows.length > 0;
  } while (exists);
  return code;
}

const clientController = {
  // Get all clients for a company
  getClientsByCompany: async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid company_id" });
      }

      const result = await pool.query(
        "SELECT * FROM clients WHERE company_id = $1 ORDER BY created_at DESC",
        [companyId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Get clients error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Create new client
  createClient: async (req, res) => {
    try {
      let {
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

      country = country.substring(0, 3) || "N/A"; // Ensure country is a string

      await pool.query(
        `INSERT INTO clients
          (company_id, client_code, name, matricule_fiscal, email, street, city, postal_code, country, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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

      res.json({ message: "Client created successfully" });
    } catch (err) {
      console.error("Create client error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Update client
  updateClient: async (req, res) => {
    try {
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
        `UPDATE clients SET 
          client_code = $1, name = $2, matricule_fiscal = $3, email = $4, 
          street = $5, city = $6, postal_code = $7, country = $8, phone = $9
         WHERE id = $10`,
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
          req.params.id,
        ]
      );

      res.json({ message: "Client updated successfully" });
    } catch (err) {
      console.error("Update client error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // Delete client
  deleteClient: async (req, res) => {
    try {
      await pool.query("DELETE FROM clients WHERE id = $1", [req.params.id]);
      res.json({ message: "Client deleted successfully" });
    } catch (err) {
      console.error("Delete client error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};

export default clientController;
