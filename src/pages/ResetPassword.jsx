import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { Lock, Check, X as XIcon } from "lucide-react";

const rules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.password || !form.confirm) {
      return setError("All fields required");
    }

    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }

    if (!rules.every((r) => r.test(form.password))) {
      return setError("Password does not meet strength requirements");
    }

    try {
      await axios.put(`${BASE_URL}/api/auth/reset-password/${token}`, {
        password: form.password,
      });

      setSuccess("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Reset link expired or invalid",
      );
    }
  };

  return (
    <PageLayout title="Reset Password">
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-sm rounded-2xl p-8 border border-gray-100 animate-scaleIn">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4">
            <Lock size={22} />
          </div>

          <h2 className="text-lg font-semibold text-center text-gray-800 mb-1">
            Reset Password
          </h2>
          <p className="text-gray-400 text-xs text-center mb-6">
            Enter your new password below
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {form.password && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                {rules.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${r.test(form.password) ? "text-emerald-600" : "text-gray-400"}`}
                  >
                    {r.test(form.password) ? (
                      <Check size={14} />
                    ) : (
                      <XIcon size={14} />
                    )}
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                name="confirm"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-xs text-center px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 text-xs text-center px-3 py-2 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-sm"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
