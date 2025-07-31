// backend/db.cjs
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "elfatoora",
});

module.exports = pool;
