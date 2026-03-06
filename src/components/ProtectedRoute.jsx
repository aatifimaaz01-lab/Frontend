import { Navigate, useLocation } from "react-router-dom";
import { getRoleFromToken } from "../utils/jwt";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = getRoleFromToken();
  const location = useLocation();

  // Not logged in → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Employee trying to open dashboard → redirect to profile
  if (role === "Employee" && location.pathname === "/") {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
