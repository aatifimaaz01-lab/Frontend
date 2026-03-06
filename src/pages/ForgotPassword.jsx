import { useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";

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
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Forgot Password">
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border">
          <h2 className="text-2xl font-bold text-center mb-2">
            Forgot Password
          </h2>

          <p className="text-gray-500 text-center mb-6">
            Enter your email to receive a reset link
          </p>

          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            {msg && <p className="text-green-600 text-sm text-center">{msg}</p>}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
