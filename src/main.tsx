import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Subscription from "./Components/Subscription";
import "./index.css"; // Assuming you have a global CSS file for styles
import Products from "./Components/Products";
import Clients from "./Components/Clients"; // Assuming this is the correct path for the Employees component
import Invoices from "./Components/Invoices"; // Assuming you have an Invoices component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subscribe" element={<Subscription />} />
        <Route path="/Products" element={<Products/>} />
        <Route path="/Clients" element={<Clients />} />
        
        <Route path="/Invoices" element={<Invoices />} />
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
