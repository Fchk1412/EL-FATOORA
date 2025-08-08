// backend/db.js
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug environment variables
console.log("🔍 Environment Check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
  // Connection pool configuration for Neon
  max: 20, // Maximum number of connections in the pool
  min: 0, // Minimum number of connections in the pool
  idle: 10000, // Close connections after 10 seconds of inactivity
  acquire: 60000, // Maximum time to wait for a connection
  evict: 1000, // How often to check for idle connections
  // Neon-specific optimizations
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  allowExitOnIdle: false,
});

// Test the connection
pool.on("connect", () => {
  console.log("✅ Connected to Neon PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
  // Don't exit in production - let the app handle errors gracefully
  if (process.env.NODE_ENV !== "production") {
    process.exit(-1);
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  pool.end(() => {
    console.log("🔌 Database connection pool closed");
    process.exit(0);
  });
});

export default pool;
