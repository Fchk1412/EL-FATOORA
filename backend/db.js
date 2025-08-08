// backend/db.js
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from multiple possible locations
const envPaths = [
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", ".env.production"),
  path.join(__dirname, "..", ".env.local"),
];

// Try loading environment files
for (const envPath of envPaths) {
  dotenv.config({ path: envPath, override: false });
}

// Also try default dotenv config
dotenv.config({ override: false });

// Debug environment variables
console.log("🔍 Environment Check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"
);
if (process.env.DATABASE_URL) {
  // Show only the host part for security
  const url = new URL(process.env.DATABASE_URL);
  console.log("DB Host:", url.hostname);
}

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
