import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getRoleFromToken } from "../utils/jwt";
import { usePermissions } from "../context/PermissionContext";
import { hasPermission } from "../utils/permissions";
import { X, Loader2, UserX } from "lucide-react";

export default function LoggedInEmployees() {
  const [present, setPresent] = useState([]);
  const [loggedOut, setLoggedOut] = useState([]);
  const [absent, setAbsent] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const role = getRoleFromToken();
  const { permissions } = usePermissions();

  /* ================= FETCH FUNCTION ================= */
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [p, l, a] = await Promise.all([
        axios.get(`${BASE_URL}/api/attendance/logged-in`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/attendance/logged-out`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/attendance/absent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPresent(p.data.data || []);
      setLoggedOut(l.data.data || []);
      setAbsent(a.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= USE EFFECT ================= */
  useEffect(() => {
    // Check dynamic permission
    if (
      !hasPermission(permissions, "employee_status", "view") &&
      role !== "Super Admin"
    ) {
      Swal.fire(
        "Access Denied",
        "You don't have permission to access this page",
        "error",
      );
      navigate("/");
      return;
    }

    // Load data first time
    fetchData();

    // Get token
    const token = localStorage.getItem("token");

    // Create live connection
    const eventSource = new EventSource(
      `${BASE_URL}/api/attendance/stream?token=${token}`,
    );

    // When server sends message
    eventSource.onmessage = () => {
      console.log("Update received");
      fetchData(); // reload attendance
    };

    // If connection error
    eventSource.onerror = () => {
      console.log("Connection closed");
      eventSource.close();
    };

    // Cleanup when leaving page
    return () => eventSource.close();
  }, [role, navigate]);

  if (loading) {
    return (
      <PageLayout title="Employee Status">
        <div className="flex items-center justify-center gap-2 p-10 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Employee Status">
      <div className="p-4 md:p-6 min-h-screen">
        <div className="grid md:grid-cols-3 gap-6">
          <StatusColumn
            title="Working Now"
            count={present.length}
            type="working"
            employees={present.map((r) => ({
              ...r.employee,
              status: "Working",
              sessions: r.sessions,
              totalMinutes: r.totalMinutes,
            }))}
            setSelectedEmployee={setSelectedEmployee}
          />
          <StatusColumn
            title="Logged Out Today"
            count={loggedOut.length}
            type="logout"
            employees={loggedOut.map((r) => ({
              ...r.employee,
              status: "Logged Out",
              sessions: r.sessions,
              totalMinutes: r.totalMinutes,
            }))}
            setSelectedEmployee={setSelectedEmployee}
          />
          <StatusColumn
            title="Absent Today"
            count={absent.length}
            type="absent"
            employees={absent.map((emp) => ({
              ...emp,
              status: "Absent",
            }))}
            setSelectedEmployee={setSelectedEmployee}
          />
        </div>
      </div>

      {/* MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                {selectedEmployee.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-lg text-gray-800 mt-3">
                {selectedEmployee.name}
              </p>
              <span
                className={`mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                  selectedEmployee.status === "Working"
                    ? "bg-emerald-50 text-emerald-600"
                    : selectedEmployee.status === "Logged Out"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-rose-50 text-rose-600"
                }`}
              >
                {selectedEmployee.status}
              </span>
            </div>
            <div className="space-y-3 text-sm px-2">
              <Detail label="Email" value={selectedEmployee.email} />
              <Detail label="Phone" value={selectedEmployee.phone_no} />
              <Detail label="Department" value={selectedEmployee.Department} />
              <Detail
                label="Designation"
                value={selectedEmployee.Designation}
              />

              {selectedEmployee.sessions && (
                <>
                  <Detail
                    label="First Check-In"
                    value={
                      selectedEmployee.sessions.length > 0
                        ? new Date(
                            selectedEmployee.sessions[0].checkIn,
                          ).toLocaleTimeString()
                        : "-"
                    }
                  />
                  <Detail
                    label="Last Check-Out"
                    value={
                      selectedEmployee.sessions.length > 0 &&
                      selectedEmployee.sessions[
                        selectedEmployee.sessions.length - 1
                      ].checkOut
                        ? new Date(
                            selectedEmployee.sessions[
                              selectedEmployee.sessions.length - 1
                            ].checkOut,
                          ).toLocaleTimeString()
                        : selectedEmployee.status === "Working"
                          ? "Still Working"
                          : "-"
                    }
                  />
                  <Detail
                    label="Total Working Time"
                    value={
                      selectedEmployee.totalMinutes
                        ? `${Math.floor(selectedEmployee.totalMinutes / 60)}h ${selectedEmployee.totalMinutes % 60}m`
                        : "0h 0m"
                    }
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

/* STATUS COLUMN */
function StatusColumn({ title, count, type, employees, setSelectedEmployee }) {
  const styles = {
    working: {
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "",
    },
    logout: {
      gradient: "from-amber-500 to-amber-600",
      shadow: "",
    },
    absent: {
      gradient: "from-rose-500 to-rose-600",
      shadow: "",
    },
  };

  return (
    <div className="space-y-4">
      <div
        className={`bg-linear-to-br ${styles[type].gradient} text-white p-5 rounded-2xl shadow-md`}
      >
        <p className="text-xs opacity-80 tracking-wide font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{count}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-h-105 overflow-y-auto divide-y divide-gray-100">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => setSelectedEmployee(emp)}
              className="p-3.5 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors group"
              tabIndex={0}
              role="button"
              aria-label={`View details for ${emp.name}`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-semibold text-blue-600 text-sm shrink-0">
                {emp.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {emp.name}
                </p>
                <p className="text-[11px] text-gray-400">{emp.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 flex flex-col items-center text-gray-400">
            <UserX size={24} className="mb-2 text-gray-300" />
            <p className="text-xs">No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* DETAIL */
function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] text-gray-400 font-medium tracking-wide">
        {label}
      </p>
      <p className="font-medium text-sm text-gray-700 break-all">
        {value || "-"}
      </p>
    </div>
  );
}
