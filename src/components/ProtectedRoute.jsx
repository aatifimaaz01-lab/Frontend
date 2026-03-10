import { Navigate, useLocation } from "react-router-dom";
import { getRoleFromToken } from "../utils/jwt";
import { usePermissions } from "../context/PermissionContext";
import { hasPermission } from "../utils/permissions";

export default function ProtectedRoute({ children, page, action }) {
  const token = localStorage.getItem("token");
  const role = getRoleFromToken();
  const location = useLocation();
  const { permissions, loading } = usePermissions();

  // Not logged in → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wait for permissions to load
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // If a page+action check is specified, enforce it
  if (page && action && role !== "Super Admin") {
    if (!hasPermission(permissions, page, action)) {
      // Redirect to first accessible page
      if (hasPermission(permissions, "dashboard", "view")) {
        return <Navigate to="/" replace />;
      }
      return <Navigate to="/profile" replace />;
    }
  }

  // Employee with no dashboard permission trying to open / → redirect to profile
  if (
    location.pathname === "/" &&
    !hasPermission(permissions, "dashboard", "view") &&
    role !== "Super Admin"
  ) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
