import { useState, useEffect } from "react";

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
    client_code: "",               // optional
    name: "",
    matricule_fiscal: "",
    email: "",
    street: "",
    city: "",
    postal_code: "",
    country: "",
    phone: "",
  });

  // Pull your company_id from wherever you stored it at login:
  const companyId = Number(localStorage.getItem("company_id"));

  useEffect(() => {
    if (!companyId) return;
    fetch(`http://localhost:5000/api/clients/${companyId}`)
      .then((r) => r.json())
      .then(setClients)
      .catch(console.error);
  }, [companyId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) {
      return alert("You must be logged in as a company first.");
    }
    // Send company_id as a number
    fetch("http://localhost:5000/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        company_id: companyId,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        // reset
        setForm({
          client_code: "",
          name: "",
          matricule_fiscal: "",
          email: "",
          street: "",
          city: "",
          postal_code: "",
          country: "",
          phone: "",
        });
        // reload list
        return fetch(`http://localhost:5000/api/clients/${companyId}`);
      })
      .then((r) => r.json())
      .then(setClients)
      .catch(console.error);
  }

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Manage Clients
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Existing Clients */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-auto">
          {clients.length === 0 ? (
            <p>No clients yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Code</th>
                  <th className="p-2">Fiscal ID</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">{c.client_code}</td>
                    <td className="p-2">{c.matricule_fiscal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Client Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="client_code"
              value={form.client_code}
              onChange={handleChange}
              placeholder="Client Code (optional)"
              className="border p-2 rounded w-full"
            />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Client Name"
              required
              className="border p-2 rounded w-full"
            />
            <input
              name="matricule_fiscal"
              value={form.matricule_fiscal}
              onChange={handleChange}
              placeholder="Fiscal ID (defaults to 999999999)"
              className="border p-2 rounded w-full"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 rounded w-full"
            />
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Street"
              className="border p-2 rounded w-full"
            />
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="border p-2 rounded w-full"
            />
            <input
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              placeholder="Postal Code"
              className="border p-2 rounded w-full"
            />
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Country (ISO code)"
              className="border p-2 rounded w-full"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="border p-2 rounded w-full"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add Client
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
