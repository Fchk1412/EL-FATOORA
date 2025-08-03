import { useState, useEffect } from "react";
import Navbar from "./Navbar";

interface Client {
  id: number;
  name: string;
}

interface Product {
  id: number;
  product_name: string;
  price: number;
  tax_rate: number;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentRib, setPaymentRib] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // — Fetch clients by numeric company_id
    fetch(`http://localhost:5000/api/clients/${user.company_id}`)
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Error fetching clients:", err));

    // — Fetch products using clientCode
    fetch(`http://localhost:5000/api/products/${user.clientCode}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));

    // — Fetch invoices using numeric company_id
    fetch(`http://localhost:5000/api/invoices/company/${user.company_id}`)
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => console.error("Error fetching invoices:", err));
  }, [user.company_id, user.clientCode]);

  function addItem() {
    setItems([...items, { product_id: "", quantity: 1 }]);
  }

  function handleItemChange(index: number, field: string, value: any) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  function handleSubmit() {
    const payload = {
      company_id: user.company_id, // ✅ Use numeric company_id instead of clientCode
      client_id: selectedClient,
      invoice_number: invoiceNumber,
      document_type: "Facture",
      invoice_date: invoiceDate,
      due_date: dueDate,
      payment_terms: paymentTerms,
      payment_rib: paymentRib,
      stamp_duty: 0.300,
      items: items.map((item) => {
        const product = products.find((p) => p.id === parseInt(item.product_id));
        return {
          product_id: product?.id,
          quantity: item.quantity,
          unit_price: product?.price,
          tax_rate: product?.tax_rate,
        };
      }),
    };

    fetch("http://localhost:5000/api/invoices/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        alert("✅ Invoice created");
        window.location.reload();
      })
      .catch(() => alert("❌ Error saving invoice"));
  }

  function handleDelete(id: number) {
    fetch(`http://localhost:5000/api/invoices/delete/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        alert("🗑️ Invoice deleted");
        window.location.reload();
      })
      .catch(() => alert("❌ Error deleting invoice"));
  }

  function handleDownloadXML(invoiceId: number) {
    window.open(`http://localhost:5000/api/invoices/xml/${invoiceId}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Manage Invoices</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice List */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl mb-4">Invoices</h3>
            {invoices.length === 0 ? (
              <p>No invoices yet.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2">Invoice #</th>
                    <th className="p-2">Client</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b">
                      <td className="p-2">{inv.invoice_number}</td>
                      <td className="p-2">{inv.client_name}</td>
                      <td className="p-2">{inv.total_amount} DT</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleDownloadXML(inv.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          XML
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Invoice Form */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl mb-4">Create Invoice</h3>

            {/* ← ONLY this select was changed to use company_id */}
            <select
              className="border p-2 w-full mb-3"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Select Client</option>
              {clients.length > 0 ? (
                clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              ) : (
                <option disabled>No clients available</option>
              )}
            </select>

            <input
              type="text"
              placeholder="Invoice Number"
              className="border p-2 w-full mb-3"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
            <input
              type="date"
              className="border p-2 w-full mb-3"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
            <input
              type="date"
              className="border p-2 w-full mb-3"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Payment Terms"
              className="border p-2 w-full mb-3"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
            <input
              type="text"
              placeholder="Payment RIB"
              className="border p-2 w-full mb-3"
              value={paymentRib}
              onChange={(e) => setPaymentRib(e.target.value)}
            />

            <h4 className="font-semibold mb-2">Invoice Items</h4>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  className="border p-2 flex-1"
                  value={item.product_id}
                  onChange={(e) => handleItemChange(idx, "product_id", e.target.value)}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="border p-2 w-20"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              className="bg-gray-300 px-3 py-1 rounded mb-4"
              onClick={addItem}
            >
              + Add Item
            </button>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}