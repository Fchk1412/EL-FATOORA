import { useState } from "react";

export default function Subscription() {
  const [companyName, setCompanyName] = useState("");
  const [matriculeFiscal, setMatriculeFiscal] = useState("");
  const [modeConnexion, setModeConnexion] = useState("SMTP");
  const [rangCompte, setRangCompte] = useState("NP");
  const [profil, setProfil] = useState("Banques");
  const [email, setEmail] = useState("");
  const [errorFiscal, setErrorFiscal] = useState("");

  const handleFiscalChange = (value: string) => {
    setMatriculeFiscal(value);

    // Regex for TVA format: 7 digits  3 uppercase letters  3 digits
    const fiscalRegex = /^\d{7}[A-Z]{3}\d{3}$/;
    if (!fiscalRegex.test(value)) {
      setErrorFiscal(
        "❌ Invalid format. Expected: 0000000XXX000 (7 digits  3 letters  3 digits)"
      );
    } else {
      setErrorFiscal("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (errorFiscal) {
      alert("Please fix the fiscal ID format before submitting.");
      return;
    }

    const payload = {
      companyName,
      matriculeFiscal,
      modeConnexion,
      rangCompte,
      profil,
      email,
    };

    fetch("http://localhost:5000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() =>
        alert(
          "✅ Subscription data saved successfully. A unique Client Code, username, and password will be generated and sent to your email."
        )
      )
      .catch((e) => alert("❌ Failed to save: " + e.message));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">
          Company Subscription
        </h2>

        {/* Company Info Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">🏢 Company Information</h3>
          <label className="block text-sm font-medium">Company Name (Nom Compte)</label>
          <input
            type="text"
            placeholder="Example: ONPS"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border p-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
            required
          />

          <label className="block text-sm font-medium">Fiscal ID (Matricule Fiscal)</label>
          <input
            type="text"
            placeholder="0000000XXX000"
            value={matriculeFiscal}
            onChange={(e) => handleFiscalChange(e.target.value.toUpperCase())}
            className={`w-full border p-2 rounded focus:ring-2 ${
              errorFiscal ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
            }`}
            required
          />
          {errorFiscal && <p className="text-red-500 text-xs">{errorFiscal}</p>}
        </div>

        {/* Contact Email */}
        <div>
          <h3 className="text-xl font-semibold mb-2">📧 Contact Email</h3>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500">
            We’ll send your login details (Client Code + Password) to this email.
          </p>
        </div>

        {/* Connection Info Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">🔌 Connection Settings</h3>
          <label className="block text-sm font-medium">Mode de connexion</label>
          <select
            value={modeConnexion}
            onChange={(e) => setModeConnexion(e.target.value)}
            className="w-full border p-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
          >
            <option value="SMTP">📧 Email (SMTP)</option>
            <option value="FTP">📂 File Transfer (FTP)</option>
            <option value="API">🌐 API (Web Service)</option>
          </select>

          <label className="block text-sm font-medium">Rang du compte</label>
          <select
            value={rangCompte}
            onChange={(e) => setRangCompte(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="NP">Network Participant (NP)</option>
            <option value="SP">Service Provider (SP)</option>
            <option value="CL">Client (CL)</option>
          </select>
        </div>

        {/* Profile Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">🏷️ Company Profile</h3>
          <label className="block text-sm font-medium">Profil</label>
          <select
            value={profil}
            onChange={(e) => setProfil(e.target.value)}
            className="w-full border p-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Banques">Banking (Banques)</option>
            <option value="Retail">Retail</option>
            <option value="Transport">Transport</option>
            <option value="Technology">Technology</option>
            <option value="Service">Service</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
        >
          Save Subscription
        </button>
      </form>
    </div>
  );
}
