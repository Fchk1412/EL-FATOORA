import { useState } from "react";

interface Client {
  id: number;
  name: string;
  tva: string;
  address: string;
  phone: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ name: "", tva: "", address: "", phone: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddOrUpdate() {
    if (!form.name || !form.tva) {
      alert("Please fill out at least the name and TVA.");
      return;
    }

    if (editingId !== null) {
      setClients((prev) =>
        prev.map((client) =>
          client.id === editingId ? { ...client, ...form } : client
        )
      );
      setEditingId(null);
    } else {
      const newClient: Client = {
        id: Date.now(),
        ...form,
      };
      setClients((prev) => [...prev, newClient]);
    }

    setForm({ name: "", tva: "", address: "", phone: "" });
  }

  function handleEdit(id: number) {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setForm({
        name: client.name,
        tva: client.tva,
        address: client.address,
        phone: client.phone,
      });
      setEditingId(id);
    }
  }

  function handleDelete(id: number) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Manage Clients
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Client List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Client List</h3>
          {clients.length === 0 ? (
            <p className="text-gray-500">No clients added yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100 text-left text-blue-700">
                  <th className="p-2">Name</th>
                  <th className="p-2">TVA</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="p-2">{client.name}</td>
                    <td className="p-2">{client.tva}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(client.id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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

        {/* Add/Edit Client Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">
            {editingId ? "Edit Client" : "Add Client"}
          </h3>
          <input
            type="text"
            name="name"
            placeholder="Client Name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            name="tva"
            placeholder="Client TVA"
            value={form.tva}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            name="address"
            placeholder="Client Address"
            value={form.address}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="text"
            name="phone"
            placeholder="Client Phone"
            value={form.phone}
            onChange={handleChange}
            className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleAddOrUpdate}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-lg font-semibold"
          >
            {editingId ? "Update Client" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
