// Mobile-optimized ProjectsList.jsx (Desktop UI unchanged)
import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import ProjectForm from "../components/ProjectForm";
import { getRoleFromToken } from "../utils/jwt";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();
  const role = getRoleFromToken();

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/projects/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProjects(res.data.data);
    } catch {
      Swal.fire("Error", "Failed to load projects", "error");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id) => {
    const result = await Swal.fire({
      title: "Delete project?",
      text: "This cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/api/projects/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProjects();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${BASE_URL}/api/projects/update-status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      fetchProjects();

      setSelectedProject((prev) => ({ ...prev, status }));

      Swal.fire({
        icon: "success",
        title: "Status updated",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Status update failed", "error");
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesTitle = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesTitle && matchesStatus;
  });

  const getStatusOptions = () => {
    if (role === "Super Admin") {
      return [
        "Pending",
        "Assigned",
        "In Progress",
        "Under Review",
        "Completed",
        "On Hold",
        "Cancelled",
        "Coding",
        "Testing",
      ];
    }
    if (role === "Employee") return ["In Progress", "Under Review"];
    return ["In Progress", "Completed", "On Hold"];
  };

  return (
    <PageLayout title="Projects">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-xs sm:text-sm font-medium"
        >
          ← Back
        </button>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-2xl border border-neutral-300 px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm focus:ring-2 focus:ring-blue-200 outline-none text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-56 rounded-2xl border border-neutral-300 px-4 py-2.5 sm:py-3 shadow-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white text-sm"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Coding">Coding</option>
            <option value="Testing">Testing</option>
          </select>
        </div>

        {role === "Super Admin" && (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow text-sm"
          >
            + Create Project
          </button>
        )}
      </div>

      {/* PROJECT CARDS */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border rounded-3xl shadow-sm py-16 sm:py-20 text-center">
          <p className="text-lg sm:text-xl font-semibold text-neutral-700">
            No Projects Yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p._id}
              onClick={() => setSelectedProject(p)}
              className="group relative bg-white rounded-3xl border border-neutral-200 p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition" />

              {/* HEADER */}
              <div className="flex justify-between items-start mb-4 sm:mb-5 gap-3">
                <div className="flex gap-3 sm:gap-4 items-center min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-blue-200 to-indigo-400 text-white flex items-center justify-center text-lg sm:text-xl font-semibold shadow shrink-0">
                    {p.title?.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-800 group-hover:text-blue-600 transition truncate">
                      {p.title}
                    </h3>

                    {p.deadline && (
                      <span className="inline-block mt-1 text-[11px] sm:text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                        ⏳ {new Date(p.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[11px] sm:text-xs px-3 py-1 rounded-full font-semibold shadow-sm whitespace-nowrap
                    ${
                      p.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : p.status === "Assigned"
                          ? "bg-blue-100 text-blue-700"
                          : p.status === "In Progress"
                            ? "bg-purple-100 text-purple-700"
                            : p.status === "Under Review"
                              ? "bg-orange-100 text-orange-700"
                              : p.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                    }`}
                >
                  {p.status}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                {p.description}
              </p>

              <div className="mt-4 sm:mt-5 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {p.members?.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] sm:text-xs font-semibold border-2 border-white"
                    >
                      {m.name.charAt(0)}
                    </div>
                  ))}

                  {p.members?.length > 4 && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[10px] sm:text-xs border-2 border-white">
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>

                <span className="text-[11px] sm:text-xs text-neutral-400">
                  {p.members?.length || 0} members
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-5 sm:mt-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(p);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border hover:bg-neutral-100 text-xs sm:text-sm"
                >
                  ✏ Edit
                </button>

                {role === "Super Admin" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(p._id);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs sm:text-sm"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreate && (
        <ModalWrapper
          title="Create Project"
          onClose={() => setShowCreate(false)}
        >
          <ProjectForm
            onSubmit={async (data) => {
              try {
                await axios.post(`${BASE_URL}/api/projects/create`, data, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });
                Swal.fire("Success", "Project created", "success");
                setShowCreate(false);
                fetchProjects();
              } catch {
                Swal.fire("Error", "Create failed", "error");
              }
            }}
          />
        </ModalWrapper>
      )}

      {/* EDIT PROJECT MODAL */}
      {editingProject && (
        <ModalWrapper
          title="Edit Project"
          onClose={() => setEditingProject(null)}
        >
          <ProjectForm
            initialData={editingProject}
            onSubmit={async (data) => {
              try {
                await axios.put(
                  `${BASE_URL}/api/projects/update/${editingProject._id}`,
                  data,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  },
                );
                Swal.fire("Updated", "Project updated successfully", "success");
                setEditingProject(null);
                fetchProjects();
              } catch {
                Swal.fire("Error", "Update failed", "error");
              }
            }}
          />
        </ModalWrapper>
      )}

      {/* DETAILS MODAL */}
      {selectedProject && (
        <ModalWrapper
          title={selectedProject.title}
          onClose={() => setSelectedProject(null)}
        >
          <span
            className={`inline-block mb-4 text-[11px] sm:text-xs px-3 py-1 rounded-full font-medium
              ${
                selectedProject.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : selectedProject.status === "Assigned"
                    ? "bg-blue-100 text-blue-700"
                    : selectedProject.status === "In Progress"
                      ? "bg-purple-100 text-purple-700"
                      : selectedProject.status === "Under Review"
                        ? "bg-orange-100 text-orange-700"
                        : selectedProject.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
              }`}
          >
            {selectedProject.status || "Pending"}
          </span>

          <p className="text-sm text-neutral-600 mb-4">
            {selectedProject.description}
          </p>

          <div className="mb-5">
            <p className="text-sm text-neutral-500 mb-1">Project Status</p>
            <select
              value={selectedProject.status || "Pending"}
              onChange={(e) =>
                updateStatus(selectedProject._id, e.target.value)
              }
              className="w-full sm:w-auto border rounded-xl px-3 py-2 text-sm"
            >
              {getStatusOptions().map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {selectedProject.deadline && (
            <p className="text-sm text-blue-600 mb-4">
              ⏳ Deadline:{" "}
              {new Date(selectedProject.deadline).toLocaleDateString()}
            </p>
          )}

          <h3 className="font-semibold mb-2">Members</h3>

          {selectedProject.members?.length === 0 ? (
            <p className="text-sm text-neutral-500">No members assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedProject.members.map((m) => (
                <span
                  key={m._id}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm"
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}
        </ModalWrapper>
      )}
    </PageLayout>
  );
}

/* REUSABLE MODAL WRAPPER */
function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col">
        {/* HEADER */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center font-semibold shrink-0">
              {title?.charAt(0)}
            </div>
            <h2 className="text-base sm:text-lg font-semibold truncate">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>

        {/* FOOTER */}
        <div className="px-5 sm:px-6 py-4 border-t bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
