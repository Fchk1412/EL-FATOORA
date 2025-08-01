import { useState, useEffect } from "react";
import Navbar from "./Navbar";

interface Client {
  id: number;
  client_code: string;
  name: string;
  matricule_fiscal: string;
  email: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    client_code: "",    // optional
    name: "",
    matricule_fiscal: "",
    email: "",
    street: "",
    city: "",
    postal_code: "",
    country: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pull your company_id from wherever you stored it at login:
  const companyId = Number(localStorage.getItem("company_id"));

  // Fetch clients on load
  useEffect(() => {
    if (!companyId) return;
    fetch(`http://localhost:5000/api/clients/${companyId}`)
      .then((r) => r.json())
      .then(setClients)
      .catch(console.error);
  }, [companyId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) {
      return alert("You must be logged in as a company first.");
    }
    const payload = {
      ...form,
      company_id: companyId,
    };

    const url = editingId
      ? `http://localhost:5000/api/clients/update/${editingId}`
      : "http://localhost:5000/api/clients/add";

    fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then(() => {
        alert(editingId ? "✅ Client updated" : "✅ Client added");
        window.location.reload();
      })
      .catch(() => alert("❌ Error saving client"));
  }

  function handleEdit(id: number) {
    const c = clients.find((c) => c.id === id);
    if (!c) return;
    setForm({
      client_code: c.client_code,
      name: c.name,
      matricule_fiscal: c.matricule_fiscal,
      email: c.email,
      street: c.street,
      city: c.city,
      postal_code: c.postal_code,
      country: c.country,
      phone: c.phone,
    });
    setEditingId(id);
  }

  function handleDelete(id: number) {
    fetch(`http://localhost:5000/api/clients/delete/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        alert("🗑️ Client deleted");
        window.location.reload();
      })
      .catch(() => alert("❌ Error deleting client"));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Manage Clients
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Client List */}
          <div className="bg-white rounded-xl shadow-md p-6 overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Client List</h3>
            {clients.length === 0 ? (
              <p className="text-gray-500">No clients added yet.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-2">Code</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="p-2">{c.client_code}</td>
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.email}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(c.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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

          {/* Client Form */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Client" : "Add Client"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                ["client_code", "Client Code (optional)"],
                ["name", "Client Name"],
                ["matricule_fiscal", "Fiscal ID"],
                ["email", "Email"],
                ["street", "Street"],
                ["city", "City"],
                ["postal_code", "Postal Code"],
                ["country", "Country"],
                ["phone", "Phone"],
              ].map(([field, placeholder]) => (
                <input
                  key={field}
                  name={field}
                  value={(form as any)[field]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="border p-2 mb-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  required={field === "name" || field === "email"}
                />
              ))}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-lg font-semibold"
              >
                {editingId ? "Update Client" : "Add Client"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
