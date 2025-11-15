// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import Vitrine from "./pages/Vitrine";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success";
import Account from "./pages/Account";
import CartCheckout from "./pages/CartCheckout";
import Cancel from "./pages/Cancel";
import OrderDetail from "./pages/OrderDetail";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./context/ProtectedRoute";
import AdminLayout from "./pages/AdminLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Vitrine />} />
        <Route path="/cart-checkout" element={<CartCheckout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />

        {/* --- Routes Admin protégées --- */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}