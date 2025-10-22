import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, message } from "antd";

import Vitrine from "./pages/Vitrine";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Cancel from "./pages/Cancel"; 
import { getMe } from "./api/ApiClient";

export default function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // 🔐 Charger automatiquement l'utilisateur connecté si token présent
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const currentUser = await getMe();
        if (currentUser) {
          setUser(currentUser);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.error("Erreur récupération utilisateur :", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // 🛒 Gestion du panier
  const handleAddToCart = (product) => {
    message.success(`${product.name} ajouté au panier !`);
    setCart((prev) => [...prev, product]);
  };

  const handleRemoveFromCart = (product) => {
    message.info(`${product.name} retiré du panier.`);
    setCart((prev) => prev.filter((p) => p.id !== product.id));
  };

  // 🚪 Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    setUser(null);
    message.info("Déconnexion réussie");
  };

  return (
    <ConfigProvider>
      <Router>
        <Navbar cartCount={cart.length} user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Vitrine onAddToCart={handleAddToCart} />} />
          <Route
            path="/cart"
            element={<Cart cart={cart} onRemove={handleRemoveFromCart} token={localStorage.getItem("token")} />}
          />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account user={user} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} adminOnly={true}>
                <AdminDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
