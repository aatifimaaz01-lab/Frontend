import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getRoleFromToken } from "../utils/jwt";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "" });

  const role = getRoleFromToken();
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

  return (
    <PageLayout title="My Profile">
      {role !== "Employee" && (
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-sm transition"
        >
          ← Go Back
        </button>
      )}

      {/* PROFILE HEADER */}

      <div className="bg-linear-to-r from-blue-600 via-blue-500 to-purple-600 text-white shadow-xl rounded-2xl p-6 mb-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {user.profilePic ? (
            <img
              src={`http://localhost:5200/uploads/${user.profilePic}`}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold border border-white/30">
              {user.name?.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-blue-100">{user.Designation}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                <p className="text-blue-100 text-xs">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>

              <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                <p className="text-blue-100 text-xs">Phone</p>
                <p className="font-semibold">{user.phone_no || "N/A"}</p>
              </div>

              <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                <p className="text-blue-100 text-xs">Department</p>
                <p className="font-semibold">{user.Department}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATTENDANCE */}

      {role === "Employee" && !loadingAttendance && (
        <div className="mb-6">
          {attendance?.activeSession ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
              <div>
                <p className="font-bold text-red-700">Live Session Active</p>
                <p className="text-sm text-red-600">
                  Checked in at{" "}
                  {new Date(
                    attendance.activeSession.checkIn,
                  ).toLocaleTimeString()}
                </p>
              </div>

              <button
                onClick={checkOut}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Check-Out
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
              <div>
                <p className="font-bold text-blue-700">You are checked out</p>
                <p className="text-sm text-blue-600">
                  Please check in to start your session.
                </p>
              </div>

              <button
                onClick={handleCheckIn}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Check-In
              </button>
            </div>
          )}
        </div>
      )}

      {/* PROJECTS */}

      {projects.length > 0 && (
        <div className="bg-white shadow-md hover:shadow-xl transition rounded-2xl p-6 mb-6 border">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold">Assigned Projects</h3>

            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              {projects.length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p._id}
                className="border rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <h4 className="font-bold mb-2">{p.title}</h4>

                <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
                  {p.description}
                </p>

                {p.deadline && (
                  <p className="text-xs text-blue-600 font-semibold">
                    Due: {new Date(p.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS */}

      {user.skills?.length > 0 && (
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6 border">
          <h3 className="text-xl font-bold mb-4">Skills</h3>

          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, i) => (
              <span
                key={i}
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm"
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
        className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
      >
        Change Password
      </button>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <input
              type="password"
              name="current"
              placeholder="Current Password"
              value={passwords.current}
              onChange={handlePassChange}
              className="w-full border rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="password"
              name="new"
              placeholder="New Password"
              value={passwords.new}
              onChange={handlePassChange}
              className="w-full border rounded-lg px-4 py-2 mb-5 focus:ring-2 focus:ring-purple-500 outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                onClick={changePassword}
                className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg"
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
