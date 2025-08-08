// backend/db.js
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "TEIF",
  port: 5432,
});

export default pool;
