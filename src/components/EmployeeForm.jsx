import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

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
  };

  const validate = () => {
    let err = {};

    if (!form.name) err.name = "Name is required";
    if (!form.email.includes("@")) err.email = "Valid email required";
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
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-5">
      {/* Name */}
      {initialData?._id && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="md:col-span-2 w-fit px-4 py-2 rounded-xl bg-neutral-200
             hover:bg-neutral-300 text-sm font-medium"
        >
          ← Back
        </button>
      )}

      <div>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Employee Name"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
      </div>

      {/* Email */}
      <div>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
      </div>

      {/* Phone */}
      <input
        name="phone_no"
        value={form.phone_no}
        onChange={handleChange}
        placeholder="Phone Number"
        className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
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
        className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm
             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
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
        className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm
             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
      >
        <option value="">Select Designation</option>
        <option value="Super Admin">Super Admin</option>
        <option value="Admin">Admin</option>
        <option value="Employee">Employee</option>
      </select>

      {/* Salary */}
      <div>
        <input
          name="salary"
          value={form.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
        <p className="text-red-500 text-xs mt-1">{errors.salary}</p>
      </div>
      {/* Skills Section */}
      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-neutral-700">Skills</label>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Type a skill and press Add"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-2 text-sm
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {/* Skills chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {form.skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-blue-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Photo */}
      {/* Profile Photo */}
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-neutral-700">
          Profile Photo
        </label>

        <div className="mt-2 border-2 border-dashed border-neutral-300 rounded-2xl p-5 text-center hover:border-blue-400 transition">
          <input
            type="file"
            name="profilePic"
            onChange={handleFile}
            className="hidden"
            id="profileUpload"
          />

          <label htmlFor="profileUpload" className="cursor-pointer block">
            <p className="text-sm text-neutral-500">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-neutral-400 mt-1">PNG, JPG up to 5MB</p>
          </label>

          {/* Preview */}
          {/* Preview */}
          {/* Preview */}
          {form.profilePic && (
            <img
              className="mt-4 w-24 h-24 object-cover rounded-full mx-auto border"
              src={
                form.profilePic instanceof FileList
                  ? URL.createObjectURL(form.profilePic[0])
                  : `http://localhost:5200/uploads/${form.profilePic}`
              }
              alt="Profile Preview"
            />
          )}
        </div>
      </div>

      {/* Documents */}
      {/* Documents */}
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-neutral-700">
          Documents
        </label>

        <div className="mt-2 border-2 border-dashed border-neutral-300 rounded-2xl p-5 hover:border-blue-400 transition">
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
            <p className="text-sm text-neutral-500">
              Click to upload documents or drag & drop
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              PDF, DOC, JPG allowed
            </p>
          </label>

          {/* File list preview */}
          {/* File list preview */}
          {form.documents?.length > 0 && (
            <div className="mt-4 space-y-2">
              {Array.from(form.documents).map((file, index) => {
                const isNewFile = file instanceof File;

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-neutral-100 px-3 py-2 rounded-lg text-sm"
                  >
                    <a
                      href={
                        isNewFile
                          ? URL.createObjectURL(file)
                          : `${BASE_URL}/${file}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-blue-600 hover:underline"
                    >
                      {isNewFile ? file.name : file.split("/").pop()}
                    </a>

                    {isNewFile && (
                      <span className="text-xs text-neutral-500">
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
        className="md:col-span-2 bg-blue-600 text-white py-3 rounded-2xl transition shadow-sm"
        disabled={loading}
        style={loading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
      >
        {loading ? "Saving..." : "Save Employee"}
      </button>
    </form>
  );
}
