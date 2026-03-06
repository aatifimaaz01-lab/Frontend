import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { getRoleFromToken } from "../utils/jwt";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Email and password required");
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/api/auth/login`, form);

      localStorage.setItem("token", res.data.token);

      // Get role from token and redirect accordingly
      const role = getRoleFromToken();
      if (role === "Employee") {
        // Automatically check in the employee
        try {
          const token = res.data.token;
          await axios.post(
            `${BASE_URL}/api/attendance/checkin`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } catch (err) {
          console.log(err);
          // Optionally handle check-in error (e.g., show a message)
        }
        navigate("/profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Invalid email or password", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Login">
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border">
          <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-center mb-6">
            Login to your account
          </p>

          <form onSubmit={login} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full mt-1 rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full mt-1 rounded-xl border px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-400 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-sm text-blue-600"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
