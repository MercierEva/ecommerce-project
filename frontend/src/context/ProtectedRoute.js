import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children, adminOnly = false }) {
  // 🔹 Pas connecté → redirection vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Accès admin requis mais l'utilisateur n'est pas admin → redirection accueil
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  // 🔹 Accès autorisé
  return children;
}
