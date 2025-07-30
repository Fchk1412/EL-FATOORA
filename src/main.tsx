import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Subscription from "./Components/Subscription";
import "./index.css";
import Products from "./Components/Products";
import Clients from "./Components/Clients";
import Invoices from "./Components/Invoices";

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
