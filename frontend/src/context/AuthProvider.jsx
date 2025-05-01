import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import Axios from "../utils/Axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [role, setRole] = useState(() => localStorage.getItem("role") || null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken") || null);

  useEffect(() => {
    if (accessToken) {
      Axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete Axios.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  const login = async (username, password) => {
    try {
      const response = await Axios.post("/login/", { username, password });

      const { access, refresh, role, user } = response.data;

      // Save in state
      setRole(role);
      setAccessToken(access);
      setUser(user);
      
      // Save in local storage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh); 

      Axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      return true;
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete Axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
