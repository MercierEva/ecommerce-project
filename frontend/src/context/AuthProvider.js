import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe, getMeAdmin } from "../api/ApiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
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
        const isAdmin = localStorage.getItem("is_admin") === "true";
        const currentUser = isAdmin ? await getMeAdmin() : await getMe();
        setUser({ ...currentUser, is_admin: isAdmin });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("is_admin");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
