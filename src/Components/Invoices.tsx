import { useState } from "react";

interface LineItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export default function Invoices() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [sellerTVA, setSellerTVA] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerTVA, setCustomerTVA] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentTermCode, setPaymentTermCode] = useState("30D");
  const [paymentTermDesc, setPaymentTermDesc] = useState("Net 30");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [nextId, setNextId] = useState(1);

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { id: nextId, productName: "", quantity: 1, unitPrice: 0, tax: 0, total: 0 },
    ]);
    setNextId((id) => id + 1);
  }

  function calculateTotal(q: number, u: number, t: number) {
    const base = q * u;
    return parseFloat((base + (base * t) / 100).toFixed(2));
  }

  function handleLineChange(
    id: number,
    field: keyof Omit<LineItem, "total">,
    raw: string | number
  ) {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const value = field === "productName" ? String(raw) : Number(raw);
        const updated = { ...item, [field]: value } as LineItem;
        updated.total = calculateTotal(
          updated.quantity,
          updated.unitPrice,
          updated.tax
        );
        return updated;
      })
    );
  }

  function removeLineItem(id: number) {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  }

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalTax = lineItems.reduce(
    (s, i) => s + (i.quantity * i.unitPrice * i.tax) / 100,
    0
  );
  const grandTotal = subtotal + totalTax;

  function handleGeneratePDF() {
    if (!sellerTVA || !invoiceNumber || lineItems.length === 0) {
      return alert("Please fill in seller TVA, invoice number, and at least one line item.");
    }

    const payload = {
      invoiceNumber,
      issueDate,
      seller: { tva: sellerTVA },
      client: { name: customerName, tva: customerTVA, address: customerAddress },
      payment: { code: paymentTermCode, description: paymentTermDesc },
      lineItems,
      totals: {
        subtotal: subtotal.toFixed(2),
        totalTax: totalTax.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
      },
    };

    fetch("http://localhost:5000/api/generate-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.blob())
      .then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${invoiceNumber}.pdf`;
        a.click();
      })
      .catch((e) => alert("Error generating PDF invoice: " + e.message));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Create Invoice
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Seller TVA"
            value={sellerTVA}
            onChange={(e) => setSellerTVA(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="text"
            placeholder="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Client Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="text"
            placeholder="Client TVA"
            value={customerTVA}
            onChange={(e) => setCustomerTVA(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="text"
            placeholder="Client Address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        {/* Payment Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Payment Term Code"
            value={paymentTermCode}
            onChange={(e) => setPaymentTermCode(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="text"
            placeholder="Payment Term Description"
            value={paymentTermDesc}
            onChange={(e) => setPaymentTermDesc(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          {lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
              <input
                type="text"
                placeholder="Product"
                value={item.productName}
                onChange={(e) => handleLineChange(item.id, "productName", e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleLineChange(item.id, "quantity", e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="number"
                min="0"
                value={item.unitPrice}
                onChange={(e) => handleLineChange(item.id, "unitPrice", e.target.value)}
                className="border p-2 rounded"
              />
              <select
                value={item.tax}
                onChange={(e) => handleLineChange(item.id, "tax", e.target.value)}
                className="border p-2 rounded"
              >
                <option value={0}>0%</option>
                <option value={7}>7%</option>
                <option value={13}>13%</option>
                <option value={19}>19%</option>
              </select>
              <div className="flex justify-between items-center">
                <span>{item.total.toFixed(2)} DT</span>
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addLineItem}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Add Line
          </button>
        </div>

        {/* Totals & Generate */}
        <div className="bg-blue-50 p-4 rounded space-y-1">
          <p>Subtotal: {subtotal.toFixed(2)} DT</p>
          <p>Total Tax: {totalTax.toFixed(2)} DT</p>
          <p className="font-bold">Grand Total: {grandTotal.toFixed(2)} DT</p>
        </div>

        <button
          onClick={handleGeneratePDF}
          disabled={lineItems.length === 0}
          className={`w-full px-6 py-3 rounded-lg text-lg font-semibold transition ${
            lineItems.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          Download Invoice PDF
        </button>
      </div>
    </div>
  );
}
