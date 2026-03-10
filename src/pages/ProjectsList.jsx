import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import ProjectForm from "../components/ProjectForm";
import { usePermissions } from "../context/PermissionContext";
import { hasPermission } from "../utils/permissions";
import {
  ArrowLeft,
  Search,
  Plus,
  Pencil,
  Trash2,
  CalendarClock,
  Users,
  FolderPlus,
  X,
} from "lucide-react";

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();
  const { permissions } = usePermissions();
  const can = (page, action) => hasPermission(permissions, page, action);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/projects/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProjects(res.data.data);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to load projects",
        "error",
      );
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
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Delete failed",
        "error",
      );
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
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Status update failed",
        "error",
      );
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesTitle = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesTitle && matchesStatus;
  });

  const getStatusOptions = () => {
    if (can("projects", "create")) {
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
    if (!can("projects", "update")) return ["In Progress", "Under Review"];
    return ["In Progress", "Completed", "On Hold"];
  };

  return (
    <PageLayout title="Projects">
      {/* TOP BAR */}
      <div className="flex flex-col gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-fit flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
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

          {can("projects", "create") && (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm text-sm font-semibold transition-all"
            >
              <Plus size={18} /> Create Project
            </button>
          )}
        </div>
      </div>

      {/* PROJECT CARDS */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 text-center">
          <FolderPlus size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No projects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filteredProjects.map((p) => (
            <div
              key={p._id}
              onClick={() => setSelectedProject(p)}
              className="group relative bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition" />

              {/* HEADER */}
              <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {p.title?.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition truncate">
                      {p.title}
                    </h3>

                    {p.deadline && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                        <CalendarClock size={11} />{" "}
                        {new Date(p.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap
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

              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {p.members?.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-semibold border-2 border-white"
                    >
                      {m.name.charAt(0)}
                    </div>
                  ))}

                  {p.members?.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] border-2 border-white">
                      +{p.members.length - 4}
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Users size={11} /> {p.members?.length || 0}
                </span>
              </div>

              <div className="flex gap-2 mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(p);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs text-gray-600 transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>

                {can("projects", "delete") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(p._id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs transition-colors"
                  >
                    <Trash2 size={13} /> Delete
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
              } catch (err) {
                Swal.fire(
                  "Error",
                  err.response?.data?.message || "Create failed",
                  "error",
                );
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
              } catch (err) {
                Swal.fire(
                  "Error",
                  err.response?.data?.message || "Update failed",
                  "error",
                );
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col">
        {/* HEADER */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-semibold text-sm shrink-0">
              {title?.charAt(0)}
            </div>
            <h2 className="text-base font-semibold truncate">{title}</h2>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
