// Mobile-optimized Profile.jsx (Desktop UI unchanged)
import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getRoleFromToken } from "../utils/jwt";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const role = getRoleFromToken();
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch(() => Swal.fire("Error", "Failed to load profile", "error"));

    axios
      .get(`${BASE_URL}/api/projects/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data.data))
      .catch(() => {});

    axios
      .get(`${BASE_URL}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAttendance(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingAttendance(false));
  }, []);

  const handlePassChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const changePassword = async () => {
    const confirm = await Swal.fire({
      title: "Update password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Update",
    });
    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/auth/change-password`, passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await Swal.fire("Updated!", "Password changed successfully", "success");
      setShowModal(false);
      setPasswords({ current: "", new: "" });
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg || "Something went wrong",
        "error",
      );
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/attendance/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Swal.fire("Checked in!", "Attendance recorded", "success");

      const res = await axios.get(`${BASE_URL}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data.data);
    } catch {
      Swal.fire("Error", "Check-in failed", "error");
    }
  };

  const checkOut = async () => {
    const confirm = await Swal.fire({
      title: "Check out now?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Check Out",
    });
    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/attendance/checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Swal.fire("Checked out!", "Session recorded", "success");

      const res = await axios.get(`${BASE_URL}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data.data);
    } catch {
      Swal.fire("Error", "Checkout failed", "error");
    }
  };

  if (!user) {
    return (
      <PageLayout title="My Profile">
        <p className="text-neutral-500">Loading...</p>
      </PageLayout>
    );
  }

  function Info({ label, value, icon }) {
    const icons = {
      email: "✉️",
      phone: "📱",
      department: "🏢",
      salary: "💰",
      default: "ℹ️",
    };
    const selectedIcon = icon || icons[label.toLowerCase()] || icons.default;

    return (
      <div className="group p-4 sm:p-5 rounded-2xl border bg-linear-to-br from-white to-gray-50 shadow-sm hover:shadow-lg hover:border-blue-300 hover:from-blue-50 transition duration-300">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{selectedIcon}</span>
          <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest font-bold">
            {label}
          </p>
        </div>
        <p className="font-bold text-neutral-800 group-hover:text-blue-600 transition text-base sm:text-lg mt-1 wrap-words">
          {value}
        </p>
      </div>
    );
  }

  return (
    <PageLayout title="My Profile">
      {role !== "Employee" && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-xs sm:text-sm font-medium"
        >
          ← Go Back
        </button>
      )}

      {/* CHECK-IN/OUT BUTTON */}
      {role === "Employee" &&
        !loadingAttendance &&
        (attendance?.activeSession ? (
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-red-50 to-orange-50 border border-red-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-200 flex items-center justify-center text-red-600 text-lg sm:text-xl animate-pulse">
                🔴
              </div>
              <div>
                <p className="text-xs sm:text-sm text-red-700 font-bold uppercase tracking-wide">
                  ⏱️ Live Session Active
                </p>
                <p className="text-[11px] sm:text-xs text-red-600 mt-1">
                  Checked in at{" "}
                  {new Date(
                    attendance.activeSession.checkIn,
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={checkOut}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 font-bold shadow-lg transition"
            >
              🚪 Check-Out
            </button>
          </div>
        ) : (
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-lg sm:text-xl animate-pulse">
                🔵
              </div>
              <div>
                <p className="text-xs sm:text-sm text-blue-700 font-bold uppercase tracking-wide">
                  You are currently checked out
                </p>
                <p className="text-[11px] sm:text-xs text-blue-600 mt-1">
                  Please check in to start your session.
                </p>
              </div>
            </div>
            <button
              onClick={handleCheckIn}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg transition"
            >
              ✓ Check-In
            </button>
          </div>
        ))}

      <div className="space-y-6 sm:space-y-8">
        {/* HERO */}
        <div className="relative bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-12 rounded-3xl text-white flex flex-col sm:flex-row items-center gap-6 sm:gap-8 overflow-hidden shadow-2xl text-center sm:text-left">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20" />

          {user.profilePic ? (
            <img
              src={`http://localhost:5200/uploads/${user.profilePic}`}
              alt="profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-2xl z-10"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/25 flex items-center justify-center text-4xl sm:text-5xl font-bold z-10">
              {user.name?.charAt(0)}
            </div>
          )}

          <div className="z-10">
            <p className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-widest">
              Welcome Back
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mt-1">
              {user.name}
            </h2>
            <p className="text-base sm:text-lg text-white/90 mt-2 font-medium">
              {user.Designation}
            </p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <span className="text-[10px] sm:text-xs bg-white/25 px-3 py-2 rounded-full font-semibold border border-white/30">
                📍 {user.Department}
              </span>
              <span className="text-[10px] sm:text-xs bg-white/25 px-3 py-2 rounded-full font-semibold border border-white/30">
                💰 ₹{user.salary?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <Info label="Email" value={user.email} icon="✉️" />
            <Info label="Phone" value={user.phone_no || "N/A"} icon="📱" />
            <Info label="Department" value={user.Department} icon="🏢" />
            <Info
              label="Salary"
              value={`₹${user.salary?.toLocaleString() || "N/A"}`}
              icon="💰"
            />
          </div>
        </div>

        {/* SKILLS */}
        {user.skills?.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {user.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Assigned Projects
              </h3>
              <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                {projects.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="p-5 rounded-2xl border bg-linear-to-br from-white to-gray-50 shadow-md"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base sm:text-lg">
                      {p.title?.charAt(0)}
                    </div>
                    <h4 className="font-bold text-neutral-800 text-base sm:text-lg">
                      {p.title}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 mb-4">
                    {p.description}
                  </p>

                  {p.deadline && (
                    <p className="text-[11px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      📅 Due: {new Date(p.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHANGE PASSWORD */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg text-base sm:text-lg"
        >
          🔐 Change Password
        </button>
      </div>

      {/* PASSWORD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                🔐 Change Password
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-2">
                Update your password to keep your account secure
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="text-xs sm:text-sm font-bold text-gray-700 mb-2 block">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current"
                  placeholder="Enter your current password"
                  value={passwords.current}
                  onChange={handlePassChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-gray-700 mb-2 block">
                  New Password
                </label>
                <input
                  type="password"
                  name="new"
                  placeholder="Enter your new password"
                  value={passwords.new}
                  onChange={handlePassChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={changePassword}
                className="px-5 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
