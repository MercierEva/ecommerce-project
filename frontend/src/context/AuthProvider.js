// context/AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getMe, getMeAdmin, loginUser } from "../api/ApiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔐 LOGIN (appelé par Login.jsx) */
  const login = async (email, password) => {
    const { user } = await loginUser({ email, password });
    setUser(user);
    return user;
  };

  /* 🔁 LOAD SESSION AU DEMARRAGE */
  useEffect(() => {
    const init = async () => {
      const accessToken = localStorage.getItem("access_token");
      const isAdmin = localStorage.getItem("is_admin") === "true";

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const me = isAdmin ? await getMeAdmin() : await getMe();
        setUser(me);
      } catch {
        // token invalid
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* 🚪 LOGOUT */
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
