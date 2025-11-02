import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Account from "./pages/Account";

import AdminLayout from "./pages/AdminLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";

import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Wrapper pour conditionner la navbar selon le rôle
function NavbarWrapper({ children }) {
  const { user } = useAuth();
  return (
    <>
      {!user?.is_admin && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <NavbarWrapper>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/success" element={<Success />} />
                <Route path="/cancel" element={<Cancel />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<Account />} />

                {/* --- Routes Admin protégées --- */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                </Route>
              </Routes>
            </NavbarWrapper>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}
