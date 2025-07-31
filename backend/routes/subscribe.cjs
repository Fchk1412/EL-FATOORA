const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const pool = require("../db.cjs");

const router = express.Router();

// Generate unique 8-digit client code
async function generateClientCode() {
  let code;
  let exists = true;

  while (exists) {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const [rows] = await pool.query("SELECT id FROM companies WHERE client_code = ?", [code]);
    exists = rows.length > 0;
  }
  return code;
}

// Generate random password
function generatePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pass = "";
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

router.post("/subscribe", async (req, res) => {
  try {
    const {
      companyName,
      matriculeFiscal,
      modeConnexion,
      rangCompte,
      profil,
      email,
    } = req.body;

    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const clientCode = await generateClientCode();

    await pool.query(
      `INSERT INTO companies 
       (company_name, matricule_fiscal, mode_connexion, rang_compte, profil, client_code, email, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyName,
        matriculeFiscal,
        modeConnexion,
        rangCompte,
        profil,
        clientCode,
        email,
        passwordHash,
      ]
    );

    // Send credentials via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tazzatrojette@gmail.com",
        pass: "anhgvztslzcgsiuc", // Use Gmail App Password
      },
    });

    await transporter.sendMail({
      from: "yourcompany@gmail.com",
      to: email,
      subject: "Your ELFATOORA Account",
      text: `Hello ${companyName},

Your account has been successfully created.

Client Code: ${clientCode}
Username: ${email}
Password: ${plainPassword}

You can now log in to create and manage invoices.

Best regards,
ELFATOORA Team`,
    });

    res.json({ message: "Subscription successful", clientCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
