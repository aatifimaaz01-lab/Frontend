import { BrowserRouter, Routes, Route } from "react-router-dom";

import EmployeeList from "./pages/EmployeeList";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ProjectsList from "./pages/ProjectsList";
import Dashboard from "./pages/Dashboard";
import SetPassword from "./pages/SetPassword";
import MyProjects from "./pages/MyProjects";
import Reports from "./pages/Report";
import LoggedInEmployees from "./pages/LoggedInEmployees";
import AdminLogs from "./pages/AdminLogs";
import RoleManagement from "./pages/RoleManagement";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute>
              <AdminLogs />
            </ProtectedRoute>
          }
        />

        <Route path="/set-password/:token" element={<SetPassword />} />

        <Route
          path="/employeelist"
          element={
            <ProtectedRoute page="employees" action="view">
              <EmployeeList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-projects"
          element={
            <ProtectedRoute>
              <MyProjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logged-in-employees"
          element={
            <ProtectedRoute page="employee_status" action="view">
              <LoggedInEmployees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute page="roles" action="view">
              <RoleManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
