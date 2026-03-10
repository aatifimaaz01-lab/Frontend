import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
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
  Menu,
  PanelLeftOpen,
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
            ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50"
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
          ${isActive ? "bg-white/20" : open ? "bg-gray-50 group-hover:bg-white group-hover:shadow-sm" : ""}
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

  const can = (page, action) => hasPermission(permissions, page, action);

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
      focusCancel: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Auto check-out if employee has an active session
        try {
          const token = localStorage.getItem("token");
          if (token) {
            await axios.post(
              `${BASE_URL}/api/attendance/checkout`,
              {},
              { headers: { Authorization: `Bearer ${token}` } },
            );
          }
        } catch {
          // Ignore — user may not have an active session
        }

        localStorage.clear();
        navigate("/login");

        Swal.fire({
          title: "Logged out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen bg-white border-r border-gray-200/80 flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out
          ${
            open
              ? "translate-x-0 w-60 md:w-64"
              : "-translate-x-full md:translate-x-0 w-16 md:w-18"
          }
        `}
      >
        {/* BRAND HEADER */}
        <div
          className={`py-5 flex items-center border-b border-gray-100 shrink-0 ${open ? "px-4 justify-between" : "px-2 justify-center"}`}
        >
          {open ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200/50">
                  <Briefcase size={18} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-900 tracking-tight truncate">
                    EmployeeMS
                  </span>
                  <span className="text-xs text-gray-400 font-medium truncate">
                    Management
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 mx-auto"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={20} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* NAV LINKS */}
        <nav
          className={`py-4 space-y-1 flex-1 overflow-y-auto stagger-children ${open ? "px-3" : "px-1.5"}`}
        >
          {open && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Menu
            </p>
          )}

          <SidebarLink
            to="/profile"
            label="Profile"
            icon={User}
            open={open}
            pathname={pathname}
            onMobileClick={closeMobile}
          />

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
        <div
          className={`border-t border-gray-100 shrink-0 ${open ? "p-3" : "p-1.5"}`}
        >
          <button
            onClick={logout}
            title={!open ? "Logout" : undefined}
            className={`w-full flex items-center justify-center rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors duration-200 text-sm ${open ? "gap-2.5 px-3 py-2.5" : "py-2.5"}`}
          >
            <LogOut size={18} />
            {open && <span className="tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
