import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, role } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/" />; // Redirect if not authenticated
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" />; // Restrict access

  return children;
};

export default PrivateRoute;
