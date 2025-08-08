// Test script to verify XML generation
import { generateInvoiceXML } from "./backend/controllers/xmlGenerator.js";

// Sample test data
const testInvoiceData = {
  invoice: {
    invoice_number: "INV-2025-001",
    invoice_date: "2025-08-07",
    due_date: "2025-09-07",
    company_name: "Test Company Ltd",
    company_client_code: "1234567ABC123",
    client_name: "Test Client",
    client_tax_number: "9876543XYZ987",
    client_address: "123 Test Street",
    client_city: "Tunis",
    client_postal_code: "1000",
    payment_terms: "Net 30",
    payment_rib: "12345678901234567890",
    total_excl_tax: 100.0,
    total_incl_tax: 119.0,
    total_tax: 19.0,
    total_amount: 119.0,
    stamp_duty: 0.3,
  },
  items: [
    {
      product_code: "PROD001",
      product_name: "Test Product",
      quantity: 2,
      unit_price: 50.0,
      tax_rate: 19,
      amount_excl_tax: 100.0,
    },
  ],
};

try {
  console.log("🧪 Testing XML generation...");
  const xmlContent = generateInvoiceXML(testInvoiceData);

  console.log("✅ XML generated successfully!");
  console.log("📄 Sample XML output:");
  console.log(xmlContent.substring(0, 500) + "...");
} catch (error) {
  console.error("❌ XML generation failed:", error.message);
}
