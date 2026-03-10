import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function PageLayout({ title, children }) {
  const location = useLocation();
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", open);
  }, [open]);

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
    <div className="flex h-screen bg-gray-50/80 overflow-hidden">
      {!hideSidebar && <Sidebar open={open} setOpen={setOpen} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {!hideSidebar && (
          <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200/80 px-4 py-3 shrink-0">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 className="font-semibold text-base text-gray-900">{title}</h1>
            <div className="w-10" />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
}
