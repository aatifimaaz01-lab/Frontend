import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../utils/axios";
import { getRoleFromToken } from "../utils/jwt";
import { usePermissions } from "../context/PermissionContext";
import { hasPermission } from "../utils/permissions";
import { BASE_URL } from "../config";

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FolderOpen,
  FileBarChart,
  ScrollText,
  UserCheck,
  Shield,
  LogOut,
  ChevronLeft,
  User,
  Briefcase,
  PanelLeftOpen,
  Building2,
} from "lucide-react";

function SidebarLink({ to, label, icon: Icon, open, pathname, onMobileClick }) {
  const isActive = pathname === to || pathname.startsWith(to + "/");

  const handleClick = () => {
    if (window.innerWidth < 768) onMobileClick();
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      title={!open ? label : undefined}
      className={`
        group relative flex items-center rounded-xl font-medium transition-all duration-200
        text-sm
        ${open ? "gap-3 px-3 py-2.5" : "justify-center py-2.5"}
        ${
          isActive
            ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
      `}
    >
      {isActive && open && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/80" />
      )}

      <div
        className={`
          flex items-center justify-center shrink-0 transition-all duration-200
          ${open ? "w-9 h-9 rounded-lg" : "w-10 h-10 rounded-xl"}
          ${isActive ? "bg-white/20" : ""}
        `}
      >
        <Icon size={open ? 18 : 20} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      {open && <span className="truncate text-sm tracking-wide">{label}</span>}
    </Link>
  );
}

export default function Sidebar({ open, setOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = getRoleFromToken();
  const { permissions } = usePermissions();

  const can = (page, action) =>
    role === "Super Admin" || hasPermission(permissions, page, action);

  const closeMobile = () => setOpen(false);

  const logout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");

          if (token) {
            await axios.post(
              `${BASE_URL}/api/attendance/checkout`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
          }
        } catch {
          // ignore error
        }

        localStorage.clear();
        navigate("/login");

        Swal.fire({
          title: "Logged out!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen bg-white border-r border-gray-200 flex flex-col
          transition-all duration-300
          ${
            open
              ? "translate-x-0 w-60 md:w-64"
              : "-translate-x-full md:translate-x-0 w-16"
          }
        `}
      >
        {/* HEADER */}
        <div
          className={`py-5 flex items-center border-b border-gray-100 ${
            open ? "px-4 justify-between" : "px-2 justify-center"
          }`}
        >
          {open ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Briefcase size={18} className="text-white" />
                </div>

                <span className="font-bold text-gray-900">EmployeeMS</span>
              </div>

              <button onClick={() => setOpen(false)}>
                <ChevronLeft size={18} />
              </button>
            </>
          ) : (
            <button onClick={() => setOpen(true)}>
              <PanelLeftOpen size={20} />
            </button>
          )}
        </div>

        {/* MENU */}
        <nav className="py-4 space-y-1 flex-1 overflow-y-auto px-2">
          {can("dashboard", "view") && (
            <SidebarLink
              to="/"
              label="Dashboard"
              icon={LayoutDashboard}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          <SidebarLink
            to="/profile"
            label="Profile"
            icon={User}
            open={open}
            pathname={pathname}
            onMobileClick={closeMobile}
          />

          {can("customers", "view") && (
            <SidebarLink
              to="/customers"
              label="Customers"
              icon={Building2}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          {can("employees", "view") && (
            <SidebarLink
              to="/employeelist"
              label="Employees"
              icon={Users}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          {can("projects", "view") && (
            <SidebarLink
              to="/projects"
              label="Projects"
              icon={FolderKanban}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          {can("my_projects", "view") && role === "Employee" && (
            <SidebarLink
              to="/my-projects"
              label="My Projects"
              icon={FolderOpen}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          {can("reports", "view") && (
            <SidebarLink
              to="/reports"
              label="Reports"
              icon={FileBarChart}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          {can("logs", "view") && (
            <SidebarLink
              to="/admin/logs"
              label="Logs"
              icon={ScrollText}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          {can("employee_status", "view") && (
            <SidebarLink
              to="/logged-in-employees"
              label="Employee Status"
              icon={UserCheck}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}

          {can("roles", "view") && (
            <SidebarLink
              to="/roles"
              label="Roles & Permissions"
              icon={Shield}
              open={open}
              pathname={pathname}
              onMobileClick={closeMobile}
            />
          )}
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-gray-100 p-2">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-xl py-2"
          >
            <LogOut size={18} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
