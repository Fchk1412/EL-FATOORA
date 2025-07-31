import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white p-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">ELFATOORA Dashboard</h1>
        <div className="flex items-center space-x-6">
          <span className="text-sm">Welcome, {user.companyName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Clients Card */}
        <Link
          to="/dashboard/clients"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-semibold text-blue-700">Manage Clients</h2>
          <p className="text-gray-600 text-center mt-2">
            Add, edit, and manage your company’s clients for quick invoice generation.
          </p>
        </Link>

        {/* Products Card */}
        <Link
          to="/dashboard/products"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-semibold text-blue-700">Manage Products</h2>
          <p className="text-gray-600 text-center mt-2">
            Add or update products, prices, and tax details for your invoices.
          </p>
        </Link>

        {/* Invoices Card */}
        <Link
          to="/dashboard/invoices"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-semibold text-blue-700">Create Invoices</h2>
          <p className="text-gray-600 text-center mt-2">
            Generate new invoices with pre-filled client and product information.
          </p>
        </Link>
      </div>
    </div>
  );
}
