import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";

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
      .catch(() => Swal.fire("Error", "Failed to load employees", "error"));
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
    <form onSubmit={submit} className="space-y-6">
      {/* TITLE */}
      <div>
        <label className="text-sm font-medium text-neutral-700">
          Project Title
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full mt-1 rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter project title"
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          className="w-full mt-1 rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Project details..."
        />
      </div>

      {/* DEADLINE */}
      <div>
        <label className="text-sm font-medium text-neutral-700">Deadline</label>
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl border px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* MEMBERS */}
      <div>
        <label className="text-sm font-medium text-neutral-700">
          Assign Members
        </label>

        {/* DROPDOWN */}
        <select
          onChange={(e) => {
            addMember(e.target.value);
            e.target.value = "";
          }}
          className="w-full mt-2 rounded-xl border px-3 py-2"
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
                className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-sm shadow-sm"
              >
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">
                  {emp.name?.charAt(0)}
                </div>

                {/* Name */}
                <span className="font-medium">{emp.name}</span>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeMember(id)}
                  className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
        disabled={loading}
        style={loading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
      >
        {loading ? "Saving..." : "Save Project"}
      </button>
    </form>
  );
}
