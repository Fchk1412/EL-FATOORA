import { useState } from "react";

export default function Subscription() {
  const [form, setForm] = useState({
    codeTva: "",
    category: "",
    tvaType: "",
    name: "",
    phone: "",
    additionalContact: "",
  });

  const [tvaError, setTvaError] = useState(false);

  const categories = [
    "Energy company",
    "Film production company",
    "Manufacturing company",
    "Mass media company",
    "Pharmaceutical company",
    "Publishing company",
    "Retail company",
    "Service company",
    "Technology company",
    "Transport company",
  ];

  const tvaTypes = [
    "Taux standard 19%",
    "Taux intermédiaire 13%",
    "Taux réduit 7%",
    "Exonération / détaxé 0%",
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "codeTva") {
      const regex = /^\d{7}\/[A-Za-z0-9]\/[A-Za-z0-9]\/[A-Za-z0-9]\/\d{3}$/;
      setTvaError(!regex.test(value));
    }
  }

  function handleSubscribe() {
    if (tvaError || !form.codeTva) {
      alert("Please provide a valid TVA Code before submitting.");
      return;
    }
    alert("Submitted company data for verification:\n" + JSON.stringify(form, null, 2));
    // TODO: Send this data to backend for verification
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Company Verification</h2>

        {/* Code TVA */}
        <input
          type="text"
          name="codeTva"
          placeholder="Code TVA (0000000/x/x/x/000)"
          value={form.codeTva}
          onChange={handleChange}
          className={`border p-3 mb-2 w-full rounded focus:ring-2 outline-none 
            ${tvaError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
        />
        {tvaError && (
          <p className="text-red-500 text-sm mb-4">
            Please provide a valid TVA Code in the format 0000000/x/x/x/000.
          </p>
        )}

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* TVA Type */}
        <select
          name="tvaType"
          value={form.tvaType}
          onChange={handleChange}
          className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select TVA Type</option>
          {tvaTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Phone */}
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="border border-gray-300 p-3 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Additional Contact Info */}
        <textarea
          name="additionalContact"
          placeholder="Additional Contact Information"
          value={form.additionalContact}
          onChange={handleChange}
          className="border border-gray-300 p-3 mb-6 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
        ></textarea>

        {/* Submit */}
        <button
          onClick={handleSubscribe}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-lg font-semibold"
        >
          Submit for Verification
        </button>
      </div>
    </div>
  );
}
