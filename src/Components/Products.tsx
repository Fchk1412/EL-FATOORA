import { useState, useEffect } from "react";
import Navbar from "./Navbar";

interface Product {
  id: number;
  product_name: string;
  product_code: string;
  price: string;
  tax_rate: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    product_name: "",
    product_code: "",
    price: "",
    tax_rate: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const taxOptions = ["19", "13", "7", "0"];
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Fetch all products on load
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${user.clientCode}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const formattedPrice = name === "price" ? value.replace(/[^\d.]/g, "") : value;
    setForm((prev) => ({ ...prev, [name]: formattedPrice }));
  }

  function handleAddOrUpdate() {
    if (!form.product_name || !form.price || !form.tax_rate || !form.product_code) {
      alert("Please fill out all fields.");
      return;
    }

    const payload = {
      ...form,
      company_id: user.clientCode, // ✅ send the logged-in company
    };

    const url = editingId
      ? `http://localhost:5000/api/products/update/${editingId}`
      : "http://localhost:5000/api/products/add";

    fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        alert(editingId ? "✅ Product updated" : "✅ Product added");
        window.location.reload();
      })
      .catch(() => alert("❌ Error saving product"));
  }

  function handleEdit(id: number) {
    const product = products.find((p) => p.id === id);
    if (product) {
      setForm({
        product_name: product.product_name,
        product_code: product.product_code,
        price: product.price.replace(" DT", ""),
        tax_rate: product.tax_rate,
      });
      setEditingId(id);
    }
  }

  function handleDelete(id: number) {
    fetch(`http://localhost:5000/api/products/delete/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        alert("🗑️ Product deleted");
        window.location.reload();
      })
      .catch(() => alert("❌ Error deleting product"));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navbar at the top */}
      <Navbar />

      <div className="p-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Manage Products</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Product List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Product List</h3>
            {products.length === 0 ? (
              <p className="text-gray-500">No products added yet.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-2">Code</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Tax</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-2">{product.product_code}</td>
                      <td className="p-2">{product.product_name}</td>
                      <td className="p-2">{product.price} DT</td>
                      <td className="p-2">{product.tax_rate}%</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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

          {/* Product Form */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Product" : "Add Product"}
            </h3>
            <input
              type="text"
              name="product_code"
              placeholder="Product Code"
              value={form.product_code}
              onChange={handleChange}
              className="border p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              name="product_name"
              placeholder="Product Name"
              value={form.product_name}
              onChange={handleChange}
              className="border p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              name="price"
              placeholder="Price (DT)"
              value={form.price}
              onChange={handleChange}
              className="border p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              name="tax_rate"
              value={form.tax_rate}
              onChange={handleChange}
              className="border p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Tax (%)</option>
              {taxOptions.map((tax) => (
                <option key={tax} value={tax}>
                  {tax}%
                </option>
              ))}
            </select>

            <button
              onClick={handleAddOrUpdate}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-lg font-semibold"
            >
              {editingId ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
