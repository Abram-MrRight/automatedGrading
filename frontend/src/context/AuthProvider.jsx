import { useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole ? storedRole : null;
  });

  useEffect(() => {
    if (user && role) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);
    }
  }, [user, role]);

  const login = (email, password) => {
    // try {
    //   const response = await fetch("http://localhost:8000/auth/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email, password }),
    //   });
    //   const data = await response.json();
    //   if (data.token) {
    //     localStorage.setItem("token", data.token);
    //     const decoded = jwtDecode(data.token);
    //     setUser(decoded.email);
    //     setRole(decoded.role);
    //     return true;
    //   }
    //   return false;
    // } catch (error) {
    //   console.error("Login failed:", error);
    //   return false;
    // }

    const mockUsers = [
      { email: "student@example.com", password: "password", role: "student" },
      { email: "educator@example.com", password: "password", role: "educator" },
      { email: "admin@example.com", password: "password", role: "admin" },
    ];
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password);
    if (foundUser) {
      const token = JSON.stringify({ email: foundUser.email, role: foundUser.role });
      localStorage.setItem("token", token);
      setUser(foundUser.email);
      setRole(foundUser.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
