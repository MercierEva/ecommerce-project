// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, message } from "antd";
import Vitrine from "./pages/Vitrine";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Cancel from "./pages/Cancel";
import Checkout from "./pages/Checkout";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { getMe } from "./api/ApiClient";
import AdminLayout from "./pages/AdminLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";

export default function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await getMe();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleAddToCart = (product) => {
    message.success(`${product.name} ajouté au panier !`);
    setCart((prev) => [...prev, product]);
  };

  const handleRemoveFromCart = (product) => {
    message.info(`${product.name} retiré du panier.`);
    setCart((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    setUser(null);
    message.info("Déconnexion réussie");
  };

  if (loading) return <div style={{ padding: 50 }}>Chargement...</div>;

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
          <Route path="/checkout" element={<Checkout cart={cart} user={user} />} />

          {/* Routes Admin imbriquées */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} adminOnly>
                <AdminLayout onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
