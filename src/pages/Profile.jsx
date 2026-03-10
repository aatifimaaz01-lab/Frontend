import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { usePermissions } from "../context/PermissionContext";
import { hasPermission } from "../utils/permissions";
import { getRoleFromToken } from "../utils/jwt";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  CalendarClock,
  LogIn,
  LogOut,
  Lock,
  Star,
  FolderKanban,
  X,
  Loader2,
  Clock,
  Timer,
  Check,
  X as XIcon,
} from "lucide-react";

const passwordRules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "" });

  const { permissions } = usePermissions();
  const can = (page, action) => hasPermission(permissions, page, action);
  const role = getRoleFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) =>
        Swal.fire(
          "Error",
          err.response?.data?.message ||
            err.response?.data?.msg ||
            "Failed to load profile",
          "error",
        ),
      );

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

      Swal.fire("Updated!", "Password changed successfully", "success");

      setShowModal(false);
      setPasswords({ current: "", new: "" });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || "Something went wrong",
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
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Check-in failed",
        "error",
      );
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
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Checkout failed",
        "error",
      );
    }
  };

  if (!user) {
    return (
      <PageLayout title="My Profile">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-blue-500 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="My Profile">
      {can("dashboard", "view") && (
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      )}

      {/* PROFILE HEADER */}

      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {user.profilePic ? (
            <img
              src={`${BASE_URL}/uploads/${user.profilePic}`}
              alt="profile"
              className="w-20 h-20 rounded-xl object-cover border-2 border-white/30 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-blue-200 text-sm">{user.Designation}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                <div className="flex items-center gap-1.5 text-blue-200 text-xs mb-0.5">
                  <Mail size={12} /> Email
                </div>
                <p className="font-medium text-sm truncate">{user.email}</p>
              </div>

              <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                <div className="flex items-center gap-1.5 text-blue-200 text-xs mb-0.5">
                  <Phone size={12} /> Phone
                </div>
                <p className="font-medium text-sm">{user.phone_no || "N/A"}</p>
              </div>

              <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                <div className="flex items-center gap-1.5 text-blue-200 text-xs mb-0.5">
                  <Building2 size={12} /> Department
                </div>
                <p className="font-medium text-sm">{user.Department}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATTENDANCE */}

      {role !== "Super Admin" &&
        role !== "Admin" &&
        can("attendance", "view") &&
        !loadingAttendance && (
          <div className="mb-6">
            {attendance?.activeSession ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                    <LogOut size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700 text-sm">
                      Live Session Active
                    </p>
                    <p className="text-xs text-red-500">
                      Checked in at{" "}
                      {new Date(
                        attendance.activeSession.checkIn,
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={checkOut}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={16} /> Check-Out
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <LogIn size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700 text-sm">
                      You are checked out
                    </p>
                    <p className="text-xs text-blue-500">
                      Please check in to start your session.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCheckIn}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5"
                >
                  <LogIn size={16} /> Check-In
                </button>
              </div>
            )}
          </div>
        )}

      {/* ATTENDANCE SUMMARY CARD */}

      {role !== "Super Admin" &&
        role !== "Admin" &&
        can("attendance", "view") &&
        !loadingAttendance &&
        attendance && (
          <div className="bg-white shadow-sm rounded-2xl p-6 mb-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-gray-400" /> Today's Attendance
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Check-In */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <LogIn size={18} className="text-emerald-600" />
                </div>
                <p className="text-[11px] text-emerald-500 font-medium mb-1">
                  First Check-In
                </p>
                <p className="text-sm font-bold text-emerald-700">
                  {attendance.sessions?.length > 0
                    ? new Date(
                        attendance.sessions[0].checkIn,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
              </div>

              {/* Check-Out */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <LogOut size={18} className="text-amber-600" />
                </div>
                <p className="text-[11px] text-amber-500 font-medium mb-1">
                  Last Check-Out
                </p>
                <p className="text-sm font-bold text-amber-700">
                  {attendance.sessions?.length > 0 &&
                  attendance.sessions[attendance.sessions.length - 1].checkOut
                    ? new Date(
                        attendance.sessions[attendance.sessions.length - 1]
                          .checkOut,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : attendance.activeSession
                      ? "Still Working"
                      : "-"}
                </p>
              </div>

              {/* Total Time */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Timer size={18} className="text-blue-600" />
                </div>
                <p className="text-[11px] text-blue-500 font-medium mb-1">
                  Total Time
                </p>
                <p className="text-sm font-bold text-blue-700">
                  {attendance.totalMinutes
                    ? `${Math.floor(attendance.totalMinutes / 60)}h ${attendance.totalMinutes % 60}m`
                    : "0h 0m"}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* PROJECTS */}

      {projects.length > 0 && (
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FolderKanban size={18} className="text-gray-400" /> Assigned
              Projects
            </h3>

            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              {projects.length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {projects.map((p) => (
              <div
                key={p._id}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-gray-50/50"
              >
                <h4 className="font-semibold text-sm text-gray-900 mb-1.5">
                  {p.title}
                </h4>

                <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                  {p.description}
                </p>

                {p.deadline && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <CalendarClock size={12} />
                    Due: {new Date(p.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS */}

      {user.skills?.length > 0 && (
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6 border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={18} className="text-gray-400" /> Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, i) => (
              <span
                key={i}
                className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD */}

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
      >
        <Lock size={16} /> Change Password
      </button>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Lock size={18} className="text-gray-400" /> Change Password
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="password"
              name="current"
              placeholder="Current Password"
              value={passwords.current}
              onChange={handlePassChange}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
            />

            <input
              type="password"
              name="new"
              placeholder="New Password"
              value={passwords.new}
              onChange={handlePassChange}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
            />

            {passwords.new && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mb-5">
                {passwordRules.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${r.test(passwords.new) ? "text-emerald-600" : "text-gray-400"}`}
                  >
                    {r.test(passwords.new) ? (
                      <Check size={14} />
                    ) : (
                      <XIcon size={14} />
                    )}
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={changePassword}
                disabled={!passwordRules.every((r) => r.test(passwords.new))}
                className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
