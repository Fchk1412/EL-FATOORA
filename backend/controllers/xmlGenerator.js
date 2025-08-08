import { create } from "xmlbuilder2";

// Helper: Format date for XML (ddMMyy format)
export function formatDateForXML(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}${month}${year}`;
}

// Helper: Generate XML content using xmlbuilder2
export function generateInvoiceXML(invoiceData) {
  const { invoice, items } = invoiceData;

  // Helper function to safely get values
  const safeValue = (value, defaultValue = "") => value || defaultValue;

  // Create the XML document with proper namespaces
  const doc = create({ version: "1.0", encoding: "UTF-8" }).ele("TEIF", {
    "xmlns:ds": "http://www.w3.org/2000/09/xmldsig#",
    controlingAgency: "TTN", // Note: XSD shows "controlingAgency" not "controllingAgency"
    version: "1.8.8",
  });

  // Invoice Header
  const header = doc.ele("InvoiceHeader");
  header
    .ele("MessageSenderIdentifier", { type: "I-01" })
    .txt(safeValue(invoice.company_client_code, "0000000000000"));
  header
    .ele("MessageRecieverIdentifier", { type: "I-01" })
    .txt(safeValue(invoice.client_tax_number, "0000000000000"));

  // Invoice Body
  const body = doc.ele("InvoiceBody");

  // Document info
  const bgm = body.ele("Bgm");
  bgm.ele("DocumentIdentifier").txt(safeValue(invoice.invoice_number));
  bgm.ele("DocumentType", { code: "I-11" }).txt("Facture");

  // Dates
  const dtm = body.ele("Dtm");
  dtm
    .ele("DateText", { format: "ddMMyy", functionCode: "I-31" })
    .txt(formatDateForXML(invoice.invoice_date));

  if (invoice.service_period_start && invoice.service_period_end) {
    dtm
      .ele("DateText", { format: "ddMMyy-ddMMyy", functionCode: "I-36" })
      .txt(
        `${formatDateForXML(invoice.service_period_start)}-${formatDateForXML(
          invoice.service_period_end
        )}`
      );
  }

  dtm
    .ele("DateText", { format: "ddMMyy", functionCode: "I-32" })
    .txt(formatDateForXML(invoice.due_date));

  // Partner Section
  const partnerSection = body.ele("PartnerSection");

  // Company Details (Sender)
  const companyPartner = partnerSection.ele("PartnerDetails", {
    functionCode: "I-62",
  });
  const companyNad = companyPartner.ele("Nad");
  companyNad
    .ele("PartnerIdentifier", { type: "I-01" })
    .txt(safeValue(invoice.company_client_code, "0000000000000"));
  companyNad
    .ele("PartnerName", { nameType: "Qualification" })
    .txt(safeValue(invoice.company_name));

  const companyAddresses = companyNad.ele("PartnerAdresses", { lang: "fr" });
  companyAddresses
    .ele("AdressDescription")
    .txt(safeValue(invoice.company_address));
  companyAddresses.ele("Street").txt(safeValue(invoice.company_street));
  companyAddresses.ele("CityName").txt(safeValue(invoice.company_city));
  companyAddresses
    .ele("PostalCode")
    .txt(safeValue(invoice.company_postal_code));
  companyAddresses.ele("Country", { codeList: "ISO_3166-1" }).txt("TN");

  // Client Details (Receiver)
  const clientPartner = partnerSection.ele("PartnerDetails", {
    functionCode: "I-64",
  });
  const clientNad = clientPartner.ele("Nad");
  clientNad
    .ele("PartnerIdentifier", { type: "I-01" })
    .txt(safeValue(invoice.client_tax_number, "0000000000000"));
  clientNad
    .ele("PartnerName", { nameType: "Qualification" })
    .txt(safeValue(invoice.client_name));

  const clientAddresses = clientNad.ele("PartnerAdresses", { lang: "fr" });
  clientAddresses
    .ele("AdressDescription")
    .txt(safeValue(invoice.client_address));
  clientAddresses.ele("Street").txt(safeValue(invoice.client_street));
  clientAddresses.ele("CityName").txt(safeValue(invoice.client_city));
  clientAddresses.ele("PostalCode").txt(safeValue(invoice.client_postal_code));
  clientAddresses.ele("Country", { codeList: "ISO_3166-1" }).txt("TN");

  // Payment Section
  if (invoice.payment_terms || invoice.payment_rib) {
    const pytSection = body.ele("PytSection");
    const pytDetails = pytSection.ele("PytSectionDetails");

    const pyt1 = pytDetails.ele("Pyt");
    pyt1.ele("PaymentTearmsTypeCode").txt("I-114");
    pyt1.ele("PaymentTearmsDescription").txt(safeValue(invoice.payment_terms));

    if (invoice.payment_rib) {
      const pyt2 = pytDetails.ele("Pyt");
      pyt2.ele("PaymentTearmsTypeCode").txt("I-115");
      pyt2
        .ele("PaymentTearmsDescription")
        .txt(`RIB: ${safeValue(invoice.payment_rib)}`);
    }
  }

  // Line Items
  const linSection = body.ele("LinSection");
  items.forEach((item, index) => {
    const lin = linSection.ele("Lin");
    lin.ele("ItemIdentifier").txt((index + 1).toString());

    const linImd = lin.ele("LinImd", { lang: "fr" });
    linImd.ele("ItemCode").txt(safeValue(item.product_code, "PROD"));
    linImd.ele("ItemDescription").txt(safeValue(item.product_name));

    const linQty = lin.ele("LinQty");
    linQty
      .ele("Quantity", { measurementUnit: "UNIT" })
      .txt(Number(item.quantity).toFixed(3));

    const linTax = lin.ele("LinTax");
    linTax.ele("TaxTypeName", { code: "I-1602" }).txt("TVA");
    const taxDetails = linTax.ele("TaxDetails");
    taxDetails.ele("TaxRate").txt(Number(item.tax_rate).toFixed(2));

    const linMoa = lin.ele("LinMoa");

    // Unit price
    const moaDetails1 = linMoa.ele("MoaDetails");
    const moa1 = moaDetails1.ele("Moa", {
      amountTypeCode: "I-183",
      currencyCodeList: "ISO_4217",
    });
    moa1
      .ele("Amount", { currencyIdentifier: "TND" })
      .txt(Number(item.unit_price).toFixed(3));

    // Line total excluding tax
    const moaDetails2 = linMoa.ele("MoaDetails");
    const moa2 = moaDetails2.ele("Moa", {
      amountTypeCode: "I-171",
      currencyCodeList: "ISO_4217",
    });
    moa2
      .ele("Amount", { currencyIdentifier: "TND" })
      .txt(Number(item.amount_excl_tax).toFixed(3));
  });

  // Invoice Totals
  const invoiceMoa = body.ele("InvoiceMoa");

  // Total excluding tax
  const amountDetails1 = invoiceMoa.ele("AmountDetails");
  const totalExclMoa = amountDetails1.ele("Moa", {
    amountTypeCode: "I-176",
    currencyCodeList: "ISO_4217",
  });
  totalExclMoa
    .ele("Amount", { currencyIdentifier: "TND" })
    .txt(Number(invoice.total_excl_tax).toFixed(3));

  // Total including tax
  const amountDetails2 = invoiceMoa.ele("AmountDetails");
  const totalInclMoa = amountDetails2.ele("Moa", {
    amountTypeCode: "I-180",
    currencyCodeList: "ISO_4217",
  });
  totalInclMoa
    .ele("Amount", { currencyIdentifier: "TND" })
    .txt(Number(invoice.total_amount).toFixed(3));
  totalInclMoa
    .ele("AmountDescription", { lang: "fr" })
    .txt(safeValue(invoice.total_amount_words));

  // Total tax
  const amountDetails3 = invoiceMoa.ele("AmountDetails");
  const totalTaxMoa = amountDetails3.ele("Moa", {
    amountTypeCode: "I-181",
    currencyCodeList: "ISO_4217",
  });
  totalTaxMoa
    .ele("Amount", { currencyIdentifier: "TND" })
    .txt(Number(invoice.total_tax).toFixed(3));

  // Tax Details
  const invoiceTax = body.ele("InvoiceTax");

  // Stamp duty (droit de timbre)
  const taxDetails1 = invoiceTax.ele("InvoiceTaxDetails");
  const tax1 = taxDetails1.ele("Tax");
  tax1.ele("TaxTypeName", { code: "I-1601" }).txt("droit de timbre");
  const taxDetails1Details = tax1.ele("TaxDetails");
  taxDetails1Details.ele("TaxRate").txt("0.00");

  const taxAmount1 = taxDetails1.ele("AmountDetails");
  const taxMoa1 = taxAmount1.ele("Moa", {
    amountTypeCode: "I-178",
    currencyCodeList: "ISO_4217",
  });
  taxMoa1
    .ele("Amount", { currencyIdentifier: "TND" })
    .txt(Number(invoice.stamp_duty || 0).toFixed(3));

  // VAT (TVA) - Use the most common tax rate from items
  const taxRates = items.map((item) => Number(item.tax_rate));
  const commonTaxRate = taxRates.length > 0 ? Math.max(...taxRates) : 19.0;

  const taxDetails2 = invoiceTax.ele("InvoiceTaxDetails");
  const tax2 = taxDetails2.ele("Tax");
  tax2.ele("TaxTypeName", { code: "I-1602" }).txt("TVA");
  const taxDetails2Details = tax2.ele("TaxDetails");
  taxDetails2Details.ele("TaxRate").txt(Number(commonTaxRate).toFixed(2));

  const taxAmount2 = taxDetails2.ele("AmountDetails");
  const taxMoa2 = taxAmount2.ele("Moa", {
    amountTypeCode: "I-178",
    currencyCodeList: "ISO_4217",
  });
  taxMoa2
    .ele("Amount", { currencyIdentifier: "TND" })
    .txt(Number(invoice.total_tax).toFixed(3));

  // Digital Signature (XMLDSig) - Required by TEIF schema
  const signature = doc.ele("ds:Signature");
  signature.ele("ds:SignedInfo");
  signature.ele("ds:SignatureValue");
  signature.ele("ds:KeyInfo");

  // Convert to XML string with proper formatting
  return doc.end({ prettyPrint: true });
}
