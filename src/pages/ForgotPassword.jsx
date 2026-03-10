import { useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email) return setError("Please enter your email");

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });

      setMsg("If the email exists, a reset link has been sent.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Forgot Password">
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-sm rounded-2xl p-8 border border-gray-100 animate-scaleIn">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4">
            <Mail size={22} />
          </div>

          <h2 className="text-lg font-semibold text-center text-gray-800 mb-1">
            Forgot Password
          </h2>

          <p className="text-gray-400 text-xs text-center mb-6">
            Enter your email to receive a reset link
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {msg && (
              <div className="bg-green-50 text-green-600 text-xs text-center px-3 py-2 rounded-lg">
                {msg}
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-500 text-xs text-center px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <ArrowRight size={16} /> Send Reset Link
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
