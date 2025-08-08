import { generateInvoiceXML } from "./controllers/xmlGenerator.js";

// Test data based on the TEIF schema requirements
const testData = {
  invoice: {
    invoice_number: "INV-2024-001",
    invoice_date: "2024-01-15",
    due_date: "2024-01-30",
    company_name: "Test Company SARL",
    company_client_code: "1234567890123",
    company_address: "123 Company Street",
    company_street: "Rue de la République",
    company_city: "Tunis",
    company_postal_code: "1000",
    client_name: "Test Client Ltd",
    client_tax_number: "9876543210987",
    client_address: "456 Client Avenue",
    client_street: "Avenue Habib Bourguiba",
    client_city: "Sfax",
    client_postal_code: "3000",
    total_excl_tax: 210.619,
    total_tax: 39.381,
    total_amount: 250.0,
    total_amount_words: "Deux cent cinquante dinars",
    payment_terms: "Net 30 days",
    payment_rib: "12345678901234567890",
    stamp_duty: 0.6,
  },
  items: [
    {
      product_code: "PROD001",
      product_name: "Test Product 1",
      quantity: 1,
      unit_price: 210.619,
      tax_rate: 19.0,
      amount_excl_tax: 210.619,
    },
  ],
};

try {
  console.log("🧪 Testing XML Generator with TEIF Schema...");
  console.log("==========================================");

  const xml = generateInvoiceXML(testData);

  console.log("✅ XML Generation successful!");
  console.log("\n📋 Generated XML Preview (first 1000 characters):");
  console.log("=".repeat(60));
  console.log(xml.substring(0, 1000));
  console.log("...\n");

  // Schema compliance checks
  console.log("🔍 Schema Compliance Checks:");
  console.log("=".repeat(30));

  // Check for correct attribute name
  if (xml.includes('controlingAgency="TTN"')) {
    console.log("✅ Correct controlingAgency attribute (per XSD)");
  } else {
    console.log("❌ Missing or incorrect controlingAgency attribute");
  }

  // Check for XML Digital Signature namespace
  if (xml.includes('xmlns:ds="http://www.w3.org/2000/09/xmldsig#"')) {
    console.log("✅ XML Digital Signature namespace included");
  } else {
    console.log("❌ XML Digital Signature namespace missing");
  }

  // Check for digital signature element
  if (xml.includes("<ds:Signature>")) {
    console.log("✅ Digital signature element included");
  } else {
    console.log("❌ Digital signature element missing");
  }

  // Check for proper TEIF version
  if (xml.includes('version="1.8.8"')) {
    console.log("✅ Correct TEIF version (1.8.8)");
  } else {
    console.log("❌ Incorrect or missing TEIF version");
  }

  // Check for proper quantity formatting
  if (xml.includes(".000</Quantity>")) {
    console.log("✅ Quantity formatted with 3 decimal places");
  } else {
    console.log("❌ Quantity not properly formatted");
  }

  // Check for proper tax rate formatting
  if (xml.includes("19.00</TaxRate>")) {
    console.log("✅ Tax rate formatted with 2 decimal places");
  } else {
    console.log("❌ Tax rate not properly formatted");
  }

  // Check for proper structure order
  const hasProperOrder =
    xml.indexOf("<InvoiceHeader>") < xml.indexOf("<InvoiceBody>") &&
    xml.indexOf("<InvoiceBody>") < xml.indexOf("<ds:Signature>");
  if (hasProperOrder) {
    console.log("✅ Proper element order (Header -> Body -> Signature)");
  } else {
    console.log("❌ Incorrect element order");
  }

  console.log("\n📊 XML Structure Analysis:");
  console.log("=".repeat(30));
  console.log(`Total XML length: ${xml.length} characters`);
  console.log(`Number of line items: ${testData.items.length}`);
  console.log(`Total amount: ${testData.invoice.total_amount} TND`);

  // Find signature section
  const signatureIndex = xml.indexOf("<ds:Signature>");
  if (signatureIndex !== -1) {
    console.log("\n🔐 Digital Signature Section:");
    console.log("=".repeat(30));
    const signatureEnd =
      xml.indexOf("</ds:Signature>") + "</ds:Signature>".length;
    const signatureSection = xml.substring(signatureIndex, signatureEnd);
    console.log(signatureSection);
  }
} catch (error) {
  console.error("❌ Error during XML generation:");
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
}
