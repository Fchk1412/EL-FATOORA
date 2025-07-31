import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo / Brand */}
      <Link to="/dashboard" className="text-2xl font-bold hover:text-blue-200">
        EL-FATOORA
      </Link>

      {/* Navigation Links */}
      <div className="space-x-6">
        <Link to="/dashboard/clients" className="hover:text-blue-200">
          Clients
        </Link>
        <Link to="/dashboard/products" className="hover:text-blue-200">
          Products
        </Link>
        <Link to="/dashboard/invoices" className="hover:text-blue-200">
          Invoices
        </Link>
      </div>

      {/* User Info and Logout */}
      <div className="flex items-center space-x-4">
        <span className="text-sm">👋 {user.companyName}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
