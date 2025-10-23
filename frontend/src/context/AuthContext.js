import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, logoutUser } from "../api/ApiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Charger le user depuis le token au démarrage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(u => setUser(u))
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await loginUser(credentials);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
