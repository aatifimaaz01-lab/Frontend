import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";

export default function PageLayout({ title, children }) {
  const location = useLocation();
  // Persist sidebar state in localStorage
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved === null ? true : saved === "true";
  });

  // Update localStorage whenever open changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", open);
  }, [open]);

  // pages where sidebar should NOT show
  const hideSidebarRoutes = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/set-password",
  ];

  const hideSidebar = hideSidebarRoutes.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="flex h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {!hideSidebar && <Sidebar open={open} setOpen={setOpen} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {!hideSidebar && (
          <div className="md:hidden flex items-center justify-between bg-linear-to-r from-white to-blue-50 border-b border-gray-200 px-4 py-4 shadow-lg shrink-0">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="text-3xl text-blue-600 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300 p-2 rounded-lg hover:bg-blue-100"
            >
              {open ? "✕" : "☰"}
            </button>
            <h1 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              📋 {title}
            </h1>
            <div className="w-8" />
          </div>
        )}

        {/* 🔥 THIS is the scroll container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-500">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
