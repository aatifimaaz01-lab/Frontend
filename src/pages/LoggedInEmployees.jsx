import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getRoleFromToken } from "../utils/jwt";

export default function LoggedInEmployees() {
  const [present, setPresent] = useState([]);
  const [loggedOut, setLoggedOut] = useState([]);
  const [absent, setAbsent] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const role = getRoleFromToken();

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
    // Only Super Admin allowed
    if (role !== "Super Admin") {
      Swal.fire("Access Denied", "Only Super Admin can access", "error");
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
        <div className="p-10 text-center text-gray-500">Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Employee Status">
      <div className="p-4 md:p-8 bg-linear-to-br from-indigo-50 to-white min-h-screen">
        <div className="grid md:grid-cols-3 gap-8">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative border-2 border-indigo-100">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 text-2xl transition-colors"
              aria-label="Close"
            >
              <span aria-hidden>✕</span>
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-md border-2 border-indigo-200">
                {selectedEmployee.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-xl text-gray-800 mt-3">
                {selectedEmployee.name}
              </p>
              <span
                className={`mt-2 px-4 py-1 text-xs rounded-full font-medium shadow-sm ${
                  selectedEmployee.status === "Working"
                    ? "bg-emerald-100 text-emerald-600"
                    : selectedEmployee.status === "Logged Out"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-rose-100 text-rose-600"
                }`}
              >
                {selectedEmployee.status}
              </span>
            </div>
            <div className="space-y-4 text-sm px-2">
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
                        ? `${selectedEmployee.totalMinutes / 60} hrs`
                        : "0 hrs"
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
      shadow: "shadow-emerald-200/60",
    },
    logout: {
      gradient: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-200/60",
    },
    absent: {
      gradient: "from-rose-500 to-rose-600",
      shadow: "shadow-rose-200/60",
    },
  };

  return (
    <div className="space-y-6">
      <div
        className={`bg-linear-to-br ${styles[type].gradient} text-white p-7 rounded-3xl shadow-xl ${styles[type].shadow} border-b-4 border-white/30`}
      >
        <p className="text-sm opacity-90 tracking-wide font-medium">{title}</p>
        <p className="text-5xl font-extrabold mt-2 drop-shadow-lg">{count}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-md border max-h-105 overflow-y-auto divide-y">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => setSelectedEmployee(emp)}
              className="p-4 flex items-center gap-4 hover:bg-indigo-50/80 cursor-pointer transition-all duration-200 group"
              tabIndex={0}
              role="button"
              aria-label={`View details for ${emp.name}`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg shadow group-hover:scale-105 transition-transform">
                {emp.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                  {emp.name}
                </p>
                <p className="text-xs text-gray-500">{emp.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-gray-400 text-center">
            No employees found
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
      <p className="text-xs text-neutral-500 font-medium tracking-wide">
        {label}
      </p>
      <p className="font-semibold text-gray-700 break-all">{value || "-"}</p>
    </div>
  );
}
