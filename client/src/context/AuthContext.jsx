

// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [masterToken, setMasterToken] = useState(null);
  const [tenantToken, setTenantToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedMasterToken = localStorage.getItem("masterToken");
    const storedTenantToken = localStorage.getItem("tenantToken");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedMasterToken) setMasterToken(storedMasterToken);
    if (storedTenantToken) setTenantToken(storedTenantToken);

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.type === "master") {
      localStorage.setItem("masterToken", token);
      setMasterToken(token);
    } else {
      localStorage.setItem("tenantToken", token);
      setTenantToken(token);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("masterToken");
    localStorage.removeItem("tenantToken");
    setUser(null);
    setMasterToken(null);
    setTenantToken(null);
  };

  const getToken = () => (user?.type === "master" ? masterToken : tenantToken);
  const getMasterToken = () => masterToken;
  const getTenantToken = () => tenantToken;

  return (
    <AuthContext.Provider
      value={{ user, masterToken, tenantToken, getToken, getMasterToken, getTenantToken, login, logout, loading }}
    >
      {!loading && children} {/* Render children only after auth restored */}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
