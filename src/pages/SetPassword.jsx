import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
BASE_URL;

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BASE_URL}/api/auth/set-password/${token}`, {
        password,
      });

      alert("Password set successfully");
      navigate("/login");
    } catch {
      alert("Link expired or invalid");
    }
  };

  return (
    <PageLayout title="Set Password">
      <div className="flex justify-center">
        <form
          onSubmit={submit}
          className="bg-white p-8 rounded-2xl shadow w-full max-w-md space-y-4"
        >
          <h2 className="text-xl font-semibold">Set your password</h2>

          <input
            type="password"
            placeholder="Enter password"
            className="w-full border rounded-xl px-4 py-3"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-xl">
            Save Password
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
