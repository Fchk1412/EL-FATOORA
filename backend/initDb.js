// Database initialization script
import pool from "./db.js";
import bcrypt from "bcrypt";

async function initializeDatabase() {
  try {
    console.log("🗄️ Initializing database schema...");

    // Create Companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        client_code VARCHAR(20) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        matricule_fiscal VARCHAR(50),
        registration_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        client_code VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        matricule_fiscal VARCHAR(50) DEFAULT '999999999',
        email VARCHAR(255),
        street TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(3) DEFAULT 'TUN',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, client_code)
      )
    `);

    // Create Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        product_code VARCHAR(50) NOT NULL,
        price DECIMAL(10,3) NOT NULL,
        tax_rate DECIMAL(5,2) DEFAULT 19.00,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, product_code)
      )
    `);

    // Create Invoices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        invoice_number VARCHAR(50) NOT NULL,
        issue_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(12,3) NOT NULL,
        tax_amount DECIMAL(12,3) NOT NULL,
        total_amount DECIMAL(12,3) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        notes TEXT,
        xml_file_path VARCHAR(500),
        pdf_file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, invoice_number)
      )
    `);

    // Create Invoice Items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity DECIMAL(10,3) NOT NULL,
        unit_price DECIMAL(10,3) NOT NULL,
        tax_rate DECIMAL(5,2) NOT NULL,
        line_total DECIMAL(12,3) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
      CREATE INDEX IF NOT EXISTS idx_companies_client_code ON companies(client_code);
      CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
      CREATE INDEX IF NOT EXISTS idx_clients_client_code ON clients(company_id, client_code);
      CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
    `);

    console.log("✅ Database schema created successfully");

    // Check if sample data exists
    const companyExists = await pool.query(
      "SELECT id FROM companies WHERE email = 'admin@ttn.com'"
    );

    if (companyExists.rows.length === 0) {
      console.log("📝 Inserting sample data...");

      // Create sample company
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const companyResult = await pool.query(
        `
        INSERT INTO companies (client_code, company_name, email, password_hash, phone, address, matricule_fiscal)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
        [
          "COMP001",
          "TTN Solutions",
          "admin@ttn.com",
          hashedPassword,
          "+216 12 345 678",
          "Tunis, Tunisia",
          "1234567890",
        ]
      );

      const companyId = companyResult.rows[0].id;

      // Create sample clients
      await pool.query(
        `
        INSERT INTO clients (company_id, client_code, name, matricule_fiscal, email, street, city, postal_code, country, phone)
        VALUES 
        ($1, 'CLI001', 'Client Test 1', '1111111111', 'client1@test.com', 'Rue Test 1', 'Tunis', '1000', 'TUN', '+216 11 111 111'),
        ($1, 'CLI002', 'Client Test 2', '2222222222', 'client2@test.com', 'Rue Test 2', 'Sfax', '3000', 'TUN', '+216 22 222 222')
      `,
        [companyId]
      );

      // Create sample products
      await pool.query(
        `
        INSERT INTO products (company_id, product_name, product_code, price, tax_rate, description)
        VALUES 
        ($1, 'Service de développement web', 'WEB001', 500.000, 19.00, 'Développement d''applications web personnalisées'),
        ($1, 'Service de consultation IT', 'CONS001', 300.000, 19.00, 'Services de consultation en technologie de l''information'),
        ($1, 'Formation technique', 'FORM001', 200.000, 19.00, 'Formation technique spécialisée')
      `,
        [companyId]
      );

      console.log("✅ Sample data inserted successfully");
    } else {
      console.log("ℹ️ Sample data already exists, skipping insertion");
    }

    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export default initializeDatabase;
