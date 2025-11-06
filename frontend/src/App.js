// src/App.js
import React from "react";
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
import OrderDetail from "./pages/OrderDetail";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./context/ProtectedRoute";
import AdminLayout from "./pages/AdminLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";


export default function App() {
  return (
    <ConfigProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Vitrine />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders/:id" element={<OrderDetail />} />

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
          </CartProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}
