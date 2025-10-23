import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // 🔹 On attend la fin du chargement
  if (loading) return null; // tu peux mettre un spinner ici si tu veux

  // 🔒 Pas connecté → redirection vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Accès admin requis mais l’utilisateur n’est pas admin → redirection accueil
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  // ✅ Accès autorisé
  return children;
}
