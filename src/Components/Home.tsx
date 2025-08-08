import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-700">EL-FATOORA</h1>
        <div className="flex space-x-4">
          <Link
            to="/Login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/subscribe"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Subscribe
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-grow text-center px-6">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          Simplify Your Invoicing <br /> with <span className="text-blue-600">TEIF Compliance</span>
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          EL-FATOORA helps you create invoices that fully comply with the Tunisian Electronic Invoice Format (TEIF). 
          Easily manage your products, employees, and generate professional invoices in seconds.
        </p>
        <Link
          to="/subscribe"
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          Get Started Now
        </Link>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 bg-white">
        © 2025 EL-FATOORA. All rights reserved.
      </footer>
    </div>
  );
}
