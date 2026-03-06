import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";

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

    try {
      await axios.put(
        `http://localhost:5200/api/auth/reset-password/${token}`,
        { password: form.password },
      );

      setSuccess("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch {
      setError("Reset link expired or invalid");
    }
  };

  return (
    <PageLayout title="Reset Password">
      <form onSubmit={submit} className="max-w-md mx-auto space-y-4">
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          type="password"
          name="confirm"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handleChange}
          className="w-full rounded-xl border px-4 py-3"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Update Password
        </button>
      </form>
    </PageLayout>
  );
}
