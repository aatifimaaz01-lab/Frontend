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

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const allPassed = rules.every((r) => r.test(password));

  const submit = async (e) => {
    e.preventDefault();

    if (!allPassed) return;
    if (password !== confirm) return alert("Passwords do not match");

    try {
      await axios.post(`${BASE_URL}/api/auth/set-password/${token}`, {
        password,
      });

      alert("Password set successfully");
      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Link expired or invalid",
      );
    }
  };

  return (
    <PageLayout title="Set Password">
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <form
          onSubmit={submit}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md space-y-4 animate-scaleIn"
        >
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-2">
            <Lock size={22} />
          </div>

          <h2 className="text-lg font-semibold text-center text-gray-800">
            Set your password
          </h2>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              className={`w-full border bg-gray-50 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all ${
                confirm && confirm !== password
                  ? "border-red-400"
                  : "border-gray-200"
              }`}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && confirm !== password && (
              <p className="text-red-500 text-xs mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {password && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              {rules.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs ${r.test(password) ? "text-emerald-600" : "text-gray-400"}`}
                >
                  {r.test(password) ? <Check size={14} /> : <XIcon size={14} />}
                  {r.label}
                </div>
              ))}
            </div>
          )}

          <button
            disabled={!allPassed || (confirm && confirm !== password)}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Password
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
