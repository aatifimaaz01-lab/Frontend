import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getRoleFromToken } from "../utils/jwt";

export default function Sidebar({ open, setOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = getRoleFromToken();

  function SidebarLink({ to, label, icon, open, pathname }) {
    const isActive = pathname === to || pathname.startsWith(to + "/");

    const handleClick = () => {
      // Only close sidebar on mobile screens; do not expand/collapse on desktop
      if (window.innerWidth < 768) setOpen(false);
      // On desktop, do nothing to sidebar state, just navigate
    };

    return (
      <Link
        to={to}
        onClick={handleClick}
        className={`
        group relative flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-300 transform
        text-xs md:text-sm
        ${
          isActive
            ? "bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg scale-105 hover:scale-110"
            : "text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 hover:scale-105"
        }
      `}
      >
        {/* Active left indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-white shadow-lg animate-pulse" />
        )}

        {/* Icon circle */}
        <div
          className={`
          w-10 h-10 flex items-center justify-center rounded-xl transition-all
          ${isActive ? "bg-white/25 shadow-lg text-2xl" : "bg-linear-to-br from-gray-100 to-gray-200 text-xl group-hover:from-blue-100 group-hover:to-indigo-100"}
        `}
        >
          {icon}
        </div>

        {open && (
          <span className="tracking-wide group-hover:translate-x-1 transition-transform text-xs md:text-sm">
            {label}
          </span>
        )}
      </Link>
    );
  }

  // const linkClass = (path) =>
  //   `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
  //     pathname === path || pathname.startsWith(path + "/")
  //       ? "bg-blue-600 text-white shadow"
  //       : "text-neutral-600 hover:bg-neutral-100"
  //   }`;

  const logout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
      fixed md:static top-0 left-0 z-50
      h-screen bg-linear-to-b from-white via-blue-50 to-indigo-50 border-r border-gray-200 shadow-2xl flex flex-col overflow-hidden
      transition-all duration-500 ease-in-out will-change-[width,transform]
      ${
        open
          ? "translate-x-0 w-56 md:w-72"
          : "-translate-x-full md:translate-x-0 w-16 md:w-24"
      }
    `}
      >
        {/* BRAND HEADER */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            {open && (
              <>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
                  💼
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-sm md:text-base font-bold tracking-tight transition-all duration-500">
                    EmployeeMS
                  </span>
                  <span className="text-xs md:text-sm text-white/70 font-medium transition-all duration-500">
                    Management System
                  </span>
                </div>
              </>
            )}
            {/* {!open && (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
                💼
              </div>
            )} */}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="text-white/80 hover:text-white hover:bg-white/20 text-xl transition-all duration-300 p-2 rounded-lg shrink-0 hover:scale-110"
          >
            {open ? "◀" : "▶"}
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto transition-all duration-500">
          {role === "Employee" ? (
            <>
              <SidebarLink
                to="/profile"
                label="Profile"
                icon="👤"
                open={open}
                pathname={pathname}
              />
              <SidebarLink
                to="/my-projects"
                label="Assigned Projects"
                icon="📁"
                open={open}
                pathname={pathname}
              />
            </>
          ) : (
            <>
              <SidebarLink
                to="/"
                label="Dashboard"
                icon="📊"
                open={open}
                pathname={pathname}
              />
              <SidebarLink
                to="/employeelist"
                label="Employees"
                icon="👥"
                open={open}
                pathname={pathname}
              />
              <SidebarLink
                to="/projects"
                label="Projects"
                icon="📁"
                open={open}
                pathname={pathname}
              />
              <SidebarLink
                to="/profile"
                label="Profile"
                icon="👤"
                open={open}
                pathname={pathname}
              />
              <SidebarLink
                to="/reports"
                label="Report"
                icon="📑"
                open={open}
                pathname={pathname}
              />
              <SidebarLink
                to="/admin/logs"
                label="Logs"
                icon="📜"
                open={open}
                pathname={pathname}
              />
              {role === "Super Admin" && (
                <SidebarLink
                  to="/logged-in-employees"
                  label="Employee Status"
                  icon="🟢"
                  open={open}
                  pathname={pathname}
                />
              )}
            </>
          )}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-200 bg-linear-to-t from-red-50 to-transparent shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-linear-to-r from-red-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="text-xl">🚪</span>
            {open && (
              <span className="tracking-wide transition-opacity duration-300">
                {open ? "Logout" : ""}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
