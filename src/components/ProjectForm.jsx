import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import { X, Loader2 } from "lucide-react";

export default function ProjectForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    members: [],
  });
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState([]);

  /* LOAD EMPLOYEES */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/employees/view`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setEmployees(res.data.data))
      .catch((err) =>
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to load employees",
          "error",
        ),
      );
  }, []);

  /* PREFILL EDIT DATA (runs only once when modal opens) */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        deadline: initialData.deadline?.slice(0, 10) || "",
        members: initialData.members?.map((m) => String(m._id)) || [],
      });
    }
  }, [initialData]);

  /* INPUT CHANGE */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ADD MEMBER */
  const addMember = (id) => {
    if (!id) return;
    id = String(id);

    if (!form.members.includes(id)) {
      setForm((prev) => ({
        ...prev,
        members: [...prev.members, id],
      }));
    }
  };

  /* REMOVE MEMBER */
  const removeMember = (id) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m !== id),
    }));
  };

  /* SUBMIT */
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const result = await Swal.fire({
      title: "Save this project?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save Project",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    Promise.resolve(onSubmit(form)).finally(() => setLoading(false));
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* TITLE */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Project Title
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full mt-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          placeholder="Enter project title"
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          className="w-full mt-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          placeholder="Project details..."
        />
      </div>

      {/* DEADLINE */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Deadline
        </label>
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className="w-full mt-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
        />
      </div>

      {/* MEMBERS */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Assign Members
        </label>

        {/* DROPDOWN */}
        <select
          onChange={(e) => {
            addMember(e.target.value);
            e.target.value = "";
          }}
          className="w-full mt-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
          defaultValue=""
        >
          <option value="" disabled>
            Select employee...
          </option>

          {employees.map((e) => (
            <option key={e._id} value={String(e._id)}>
              {e.name} ({e.Designation})
            </option>
          ))}
        </select>

        {/* SELECTED MEMBERS PILLS */}
        <div className="flex flex-wrap gap-2 mt-3">
          {form.members.map((id) => {
            const emp = employees.find((e) => String(e._id) === String(id));
            if (!emp) return null;

            return (
              <div
                key={id}
                className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium"
              >
                {/* Avatar */}
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-semibold">
                  {emp.name?.charAt(0)}
                </div>

                {/* Name */}
                <span>{emp.name}</span>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeMember(id)}
                  className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving...
          </>
        ) : (
          "Save Project"
        )}
      </button>
    </form>
  );
}
