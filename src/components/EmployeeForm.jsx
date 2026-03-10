import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import { ArrowLeft, Plus, X, Upload, Loader2 } from "lucide-react";

export default function EmployeeForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    Department: "",
    Designation: "",
    salary: "",
    password: "",
    skills: [], // 👈 add this
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Fetch available roles for designation dropdown
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setRoles(data.roles);
      } catch {
        // Fall back to defaults if roles can't be fetched
        setRoles([
          { name: "Super Admin" },
          { name: "Admin" },
          { name: "Employee" },
        ]);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        name: "",
        email: "",
        phone_no: "",
        Department: "",
        Designation: "",
        salary: "",
        skills: [],
        ...initialData,
      });
    }
  }, [initialData]);

  const [skillInput, setSkillInput] = useState("");

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailTimer = useRef(null);

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setForm({
      ...form,
      skills: [...form.skills, skillInput.trim()],
    });

    setSkillInput("");
  };

  const handleFile = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.files,
    });
  };

  const removeSkill = (index) => {
    const updated = form.skills.filter((_, i) => i !== index);
    setForm({ ...form, skills: updated });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Real-time email check
    if (e.target.name === "email") {
      const email = e.target.value;
      setEmailExists(false);

      if (emailTimer.current) clearTimeout(emailTimer.current);

      if (email && email.includes("@")) {
        setCheckingEmail(true);
        emailTimer.current = setTimeout(async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
              `${BASE_URL}/api/employees/check-email`,
              {
                params: { email },
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            // Don't flag if editing the same employee's email
            if (res.data.exists && email !== initialData?.email) {
              setEmailExists(true);
            }
          } catch {
            // silently fail
          } finally {
            setCheckingEmail(false);
          }
        }, 500);
      } else {
        setCheckingEmail(false);
      }
    }
  };

  const validate = () => {
    let err = {};

    if (!form.name) err.name = "Name is required";
    if (!form.email.includes("@")) err.email = "Valid email required";
    if (emailExists) err.email = "This email is already registered";
    if (!form.salary) err.salary = "Salary is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      Promise.resolve(onSubmit(form)).finally(() => setLoading(false));
    }
  };

  return (
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
      {/* Name */}
      {initialData?._id && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="md:col-span-2 w-fit flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      <div>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Employee Name"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm
                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all
                     ${emailExists ? "border-red-400" : "border-gray-200"}`}
        />
        {checkingEmail && (
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" /> Checking email...
          </p>
        )}
        {emailExists && (
          <p className="text-red-500 text-xs mt-1">
            This email is already registered
          </p>
        )}
        {errors.email && !emailExists && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <input
        name="phone_no"
        value={form.phone_no}
        onChange={handleChange}
        placeholder="Phone Number"
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
                   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
      />
      {/* {!initialData?._id && (
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm
    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      )} */}

      {/* Department */}
      <select
        name="Department"
        required
        value={form.Department}
        onChange={handleChange}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
      >
        <option value="">Select Department</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
        <option value="Operations">Operations</option>
      </select>

      {/* Designation */}
      <select
        name="Designation"
        value={form.Designation}
        onChange={handleChange}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
             focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
      >
        <option value="">Select Designation</option>
        {roles.map((r) => (
          <option key={r.name} value={r.name}>
            {r.name}
          </option>
        ))}
      </select>

      {/* Salary */}
      <div>
        <input
          name="salary"
          value={form.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
                     focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
        />
        {errors.salary && (
          <p className="text-red-500 text-xs mt-1">{errors.salary}</p>
        )}
      </div>
      {/* Skills Section */}
      <div className="md:col-span-2 space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Skills
        </label>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Type a skill and press Add"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />

          <button
            type="button"
            onClick={addSkill}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Skills chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {form.skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-blue-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Photo */}
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Profile Photo
        </label>

        <div className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-blue-400 transition">
          <input
            type="file"
            name="profilePic"
            onChange={handleFile}
            className="hidden"
            id="profileUpload"
          />

          <label htmlFor="profileUpload" className="cursor-pointer block">
            <Upload size={20} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Click to upload or drag & drop
            </p>
            <p className="text-[11px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
          </label>

          {form.profilePic && (
            <img
              className="mt-4 w-20 h-20 object-cover rounded-xl mx-auto border border-gray-200"
              src={
                form.profilePic instanceof FileList
                  ? URL.createObjectURL(form.profilePic[0])
                  : `${BASE_URL}/uploads/${form.profilePic}`
              }
              alt="Profile Preview"
            />
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Documents
        </label>

        <div className="mt-2 border-2 border-dashed border-gray-200 rounded-xl p-5 hover:border-blue-400 transition">
          <input
            type="file"
            name="documents"
            multiple
            onChange={handleFile}
            className="hidden"
            id="docsUpload"
          />

          <label
            htmlFor="docsUpload"
            className="cursor-pointer block text-center"
          >
            <Upload size={20} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Click to upload documents or drag & drop
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              PDF, DOC, JPG allowed
            </p>
          </label>

          {form.documents?.length > 0 && (
            <div className="mt-4 space-y-2">
              {Array.from(form.documents).map((file, index) => {
                const isNewFile = file instanceof File;

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-sm"
                  >
                    <a
                      href={
                        isNewFile
                          ? URL.createObjectURL(file)
                          : `${BASE_URL}/${file}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-blue-600 hover:underline text-xs"
                    >
                      {isNewFile ? file.name : file.split("/").pop()}
                    </a>

                    {isNewFile && (
                      <span className="text-[11px] text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="md:col-span-2 flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-sm font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving...
          </>
        ) : (
          "Save Employee"
        )}
      </button>
    </form>
  );
}
