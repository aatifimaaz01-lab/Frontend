import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
// import { getRoleFromToken } from "../utils/jwt";
import { usePermissions } from "../context/PermissionContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Briefcase } from "lucide-react";
import Swal from "sweetalert2";

const demoAccounts = [
  {
    label: "Super Admin",
    email: "superadmin@demo.com",
    password: "SuperAdmin@123",
  },
  {
    label: "Admin",
    email: "admin@demo.com",
    password: "Admin@123",
  },
  {
    label: "Employee",
    email: "employee@demo.com",
    password: "Employee@123",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { refetch } = usePermissions();

  useEffect(() => {
    if (localStorage.getItem("invalidToken")) {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      localStorage.removeItem("invalidToken");
    }
  }, []);

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

  const performLogin = async (credentials) => {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, credentials);

    localStorage.setItem("token", res.data.token);

    await refetch();

    const permRes = await fetch(`${BASE_URL}/api/roles/my-permissions`, {
      headers: { Authorization: `Bearer ${res.data.token}` },
    });
    const permData = await permRes.json();
    const perms = permData.success ? permData.permissions : {};

    if (perms.dashboard && perms.dashboard.includes("view")) {
      navigate("/");
    } else {
      navigate("/profile");
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Email and password required");
    }

    try {
      setLoading(true);
      await performLogin(form);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = async (account) => {
    setError("");

    try {
      setLoading(true);
      setForm({ email: account.email, password: account.password });
      await performLogin({ email: account.email, password: account.password });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          `Unable to sign in as ${account.label}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const openDemoLoginDialog = async () => {
    const result = await Swal.fire({
      title: "Choose demo account",
      text: "Select one of the demo roles to sign in instantly.",
      input: "radio",
      inputOptions: demoAccounts.reduce((options, account) => {
        options[account.label] = account.label;
        return options;
      }, {}),
      inputValidator: (value) => {
        if (!value) {
          return "Please select an account";
        }
        return undefined;
      },
      showCancelButton: true,
      confirmButtonText: "Sign in",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
    });

    if (!result.isConfirmed || !result.value) {
      return;
    }

    const selectedAccount = demoAccounts.find(
      (account) => account.label === result.value,
    );

    if (selectedAccount) {
      await loginAsDemoUser(selectedAccount);
    }
  };

  return (
    <PageLayout title="Login">
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-scaleIn">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200/50">
              <Briefcase size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Card */}
          <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl p-8 border border-gray-100">
            <form onSubmit={login} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 pr-12 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={openDemoLoginDialog}
                className="w-full border border-dashed border-blue-300 bg-blue-50 text-blue-700 py-3 rounded-xl hover:bg-blue-100 hover:border-blue-400 transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                Demo Sign In
              </button>

              {/* <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">
                  Demo accounts available in the dialog above
                </p>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
