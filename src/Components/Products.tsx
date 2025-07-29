import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  tax: number;
  description: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    tax: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const taxOptions = ["19", "13", "7", "0"];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === "price") {
      const formatted = value.replace(/[^\d.]/g, "");
      setForm((prev) => ({ ...prev, price: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleAddOrUpdate() {
    if (!form.name || !form.price || !form.tax) {
      alert("Please fill out all required fields.");
      return;
    }

    const formattedPrice = parseFloat(form.price).toFixed(2) + " DT";

    if (editingId !== null) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingId
            ? { ...product, ...form, price: formattedPrice, tax: Number(form.tax) }
            : product
        )
      );
      setEditingId(null);
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: form.name,
        price: formattedPrice,
        tax: Number(form.tax),
        description: form.description,
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setForm({ name: "", price: "", tax: "", description: "" });
  }

  function handleEdit(id: number) {
    const product = products.find((p) => p.id === id);
    if (product) {
      setForm({
        name: product.name,
        price: product.price.replace(" DT", ""),
        tax: product.tax.toString(),
        description: product.description,
      });
      setEditingId(id);
    }
  }

  function handleDelete(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
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
                  <th className="p-2">Name</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Tax</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.price}</td>
                    <td className="p-2">{product.tax}%</td>
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
          <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit Product" : "Add Product"}</h3>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            name="price"
            placeholder="Price (DT)"
            value={form.price}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            name="tax"
            value={form.tax}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Tax (%)</option>
            {taxOptions.map((tax) => (
              <option key={tax} value={tax}>
                {tax}%
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>

          <button
            onClick={handleAddOrUpdate}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-lg font-semibold"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
