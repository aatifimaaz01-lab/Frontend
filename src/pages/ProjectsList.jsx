import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
// import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import ProjectForm from "../components/ProjectForm";
import { usePermissions } from "../context/PermissionContext";
import { hasPermission } from "../utils/permissions";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CalendarClock,
  Users,
  FolderPlus,
  X,
  ListTodo,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5200", {
  transports: ["websocket"],
});

const PREDEFINED_TASKS = {
  Design: ["Not Started", "Wireframing", "In Review", "Approved"],
  Development: ["To Do", "In Progress", "Code Review", "Done"],
  Testing: ["Pending", "In Progress", "Bug Found", "Passed"],
  "Code Review": ["Awaiting Review", "Changes Requested", "Approved"],
  Deployment: ["Scheduled", "In Progress", "Deployed", "Verified"],
};

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [progressMap, setProgressMap] = useState({});
  const [projectTasks, setProjectTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: [],
    assignAll: false,
    allowedStatuses: ["Pending", "In Progress", "Completed"],
  });
  const [employees, setEmployees] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  console.log(employees);
  // const navigate = useNavigate();
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

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tasks/progress-all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProgressMap(res.data.data);
    } catch (err) {
      console.log(err);
      // silent fail – progress is supplementary
    }
  };

  const fetchTasksForProject = async (projectId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/tasks/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setProjectTasks(res.data.data);
    } catch (err) {
      console.log(err);

      setProjectTasks([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/employees/view`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      // silent
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchProgress();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // CREATE
    socket.on("project_created", (newProject) => {
      setProjects((prev) => {
        const exists = prev.some((p) => p._id === newProject._id);
        return exists ? prev : [newProject, ...prev];
      });
      fetchProgress();
    });

    // UPDATE
    socket.on("project_updated", (updatedProject) => {
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)),
      );

      fetchProgress();
    });

    // DELETE
    socket.on("project_deleted", ({ id }) => {
      setProjects((prev) => prev.filter((p) => p._id !== id));

      fetchProgress();
    });

    // STATUS UPDATE
    socket.on("project_status_updated", (updatedProject) => {
      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)),
      );

      fetchProgress();
      // also update selected modal
      setSelectedProject((prev) =>
        prev?._id === updatedProject._id ? updatedProject : prev,
      );
    });

    return () => {
      socket.off("project_created");
      socket.off("project_updated");
      socket.off("project_deleted");
      socket.off("project_status_updated");
    };
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
      // fetchProjects();
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

      // fetchProjects();

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
    <PageLayout title="Projects" showBackButton>
      {/* TOP BAR */}
      <div className="flex flex-col gap-4 mb-6 shrink-0">
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
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {filteredProjects.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSelectedProject(p);
                  fetchTasksForProject(p._id);
                }}
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

                {/* PROGRESS BAR */}
                {(() => {
                  const prog = progressMap[p._id];
                  if (!prog || prog.total === 0) return null;
                  return (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                          <ListTodo size={10} /> {prog.total} tasks
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">
                          {prog.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            prog.progress === 100
                              ? "bg-green-500"
                              : prog.progress >= 50
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${prog.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

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
                // fetchProjects();
                // fetchProgress();
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
                //fetchProjects();
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
          onClose={() => {
            setSelectedProject(null);
            setProjectTasks([]);
            setShowTaskForm(false);
            setEditingTask(null);
          }}
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

          {/* TASK PROGRESS BAR */}
          {(() => {
            const total = projectTasks.length;
            if (total === 0) return null;
            let sumPercent = 0;
            projectTasks.forEach((t) => {
              const statuses = t.allowedStatuses || [
                "Pending",
                "In Progress",
                "Completed",
              ];
              const idx = statuses.indexOf(t.status);
              const pos = idx === -1 ? 0 : idx;
              sumPercent += (pos / (statuses.length - 1)) * 100;
            });
            const progress = Math.round(sumPercent / total);
            return (
              <div className="mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <ListTodo size={13} /> Task Progress
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      progress === 100
                        ? "bg-green-500"
                        : progress >= 50
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {total} tasks — {progress}% overall progress
                </p>
              </div>
            );
          })()}

          {selectedProject.deadline && (
            <p className="text-sm text-blue-600 mb-4">
              ⏳ Deadline:{" "}
              {new Date(selectedProject.deadline).toLocaleDateString()}
            </p>
          )}

          <h3 className="font-semibold mb-2">Members</h3>

          {selectedProject.members?.length === 0 ? (
            <p className="text-sm text-neutral-500 mb-5">No members assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-5">
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

          {/* ── TASKS SECTION ── */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ListTodo size={16} /> Tasks
              </h3>

              {can("tasks", "create") && (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setTaskForm({
                      title: "",
                      description: "",
                      assignedTo: [],
                      assignAll: false,
                      allowedStatuses: ["Pending", "In Progress", "Completed"],
                    });
                    setNewStatus("");
                    setShowTaskForm(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
                >
                  <Plus size={14} /> Add Task
                </button>
              )}
            </div>

            {/* TASK FORM */}
            {showTaskForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {editingTask ? "Edit Task" : "New Task"}
                </h4>

                <div className="space-y-3">
                  {/* PREDEFINED TASK OPTIONS */}
                  {!editingTask && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Quick Select
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(PREDEFINED_TASKS).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setTaskForm({
                                ...taskForm,
                                title: t,
                                allowedStatuses: PREDEFINED_TASKS[t],
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              taskForm.title === t
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Show preset statuses when a predefined task is selected */}
                      {PREDEFINED_TASKS[taskForm.title] && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {taskForm.allowedStatuses.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CUSTOM / EDITABLE TITLE */}
                  <input
                    type="text"
                    placeholder={
                      editingTask
                        ? "Task title *"
                        : "Or type a custom task title *"
                    }
                    value={taskForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (PREDEFINED_TASKS[val]) {
                        setTaskForm({
                          ...taskForm,
                          title: val,
                          allowedStatuses: PREDEFINED_TASKS[val],
                        });
                      } else {
                        setTaskForm({
                          ...taskForm,
                          title: val,
                          allowedStatuses: PREDEFINED_TASKS[taskForm.title]
                            ? ["Pending", "In Progress", "Completed"]
                            : taskForm.allowedStatuses,
                        });
                      }
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />

                  <textarea
                    placeholder="Description (optional)"
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  />

                  <div>
                    {/* ASSIGN ALL TOGGLE */}
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taskForm.assignAll}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            assignAll: e.target.checked,
                            assignedTo: e.target.checked
                              ? selectedProject.members.map((m) => m._id)
                              : [],
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 font-medium">
                        Assign to all members
                      </span>
                    </label>

                    {/* MEMBER CHECKBOXES */}
                    {!taskForm.assignAll && (
                      <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                        {selectedProject.members?.length === 0 ? (
                          <p className="text-xs text-gray-400 py-1 px-1">
                            No members in project
                          </p>
                        ) : (
                          selectedProject.members.map((m) => (
                            <label
                              key={m._id}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={taskForm.assignedTo.includes(m._id)}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...taskForm.assignedTo, m._id]
                                    : taskForm.assignedTo.filter(
                                        (id) => id !== m._id,
                                      );
                                  setTaskForm({
                                    ...taskForm,
                                    assignedTo: updated,
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                                {m.name?.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-700">
                                {m.name}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* CUSTOM ALLOWED STATUSES — only for custom tasks or editing */}
                  {(!PREDEFINED_TASKS[taskForm.title] || editingTask) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Allowed Statuses
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {taskForm.allowedStatuses.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
                          >
                            {s}
                            {taskForm.allowedStatuses.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setTaskForm({
                                    ...taskForm,
                                    allowedStatuses:
                                      taskForm.allowedStatuses.filter(
                                        (x) => x !== s,
                                      ),
                                    status:
                                      taskForm.status === s
                                        ? taskForm.allowedStatuses[0]
                                        : taskForm.status,
                                  })
                                }
                                className="ml-0.5 text-indigo-400 hover:text-indigo-700"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add custom status..."
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = newStatus.trim();
                              if (
                                val &&
                                !taskForm.allowedStatuses.includes(val)
                              ) {
                                setTaskForm({
                                  ...taskForm,
                                  allowedStatuses: [
                                    ...taskForm.allowedStatuses,
                                    val,
                                  ],
                                });
                                setNewStatus("");
                              }
                            }
                          }}
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = newStatus.trim();
                            if (
                              val &&
                              !taskForm.allowedStatuses.includes(val)
                            ) {
                              setTaskForm({
                                ...taskForm,
                                allowedStatuses: [
                                  ...taskForm.allowedStatuses,
                                  val,
                                ],
                              });
                              setNewStatus("");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-medium transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {editingTask && (
                    <div className="relative">
                      <select
                        value={taskForm.status || taskForm.allowedStatuses[0]}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, status: e.target.value })
                        }
                        className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pr-8"
                      >
                        {taskForm.allowedStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={async () => {
                      if (!taskForm.title.trim()) {
                        return Swal.fire(
                          "Error",
                          "Task title is required",
                          "error",
                        );
                      }
                      try {
                        if (editingTask) {
                          await axios.put(
                            `${BASE_URL}/api/tasks/update/${editingTask._id}`,
                            { ...taskForm },
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                              },
                            },
                          );
                        } else {
                          await axios.post(
                            `${BASE_URL}/api/tasks/create`,
                            { ...taskForm, projectId: selectedProject._id },
                            {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                              },
                            },
                          );
                        }
                        setShowTaskForm(false);
                        setEditingTask(null);
                        setTaskForm({
                          title: "",
                          description: "",
                          assignedTo: [],
                          assignAll: false,
                          allowedStatuses: [
                            "Pending",
                            "In Progress",
                            "Completed",
                          ],
                        });
                        setNewStatus("");
                        fetchTasksForProject(selectedProject._id);
                        fetchProgress();
                      } catch (err) {
                        Swal.fire(
                          "Error",
                          err.response?.data?.msg || "Failed",
                          "error",
                        );
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {editingTask ? "Update" : "Create"}
                  </button>

                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* TASK LIST */}
            {projectTasks.length === 0 ? (
              <div className="text-center py-6">
                <ListTodo size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-colors group/task"
                  >
                    {/* STATUS DROPDOWN */}
                    <div className="relative mt-0.5 shrink-0">
                      <select
                        value={task.status}
                        onChange={async (e) => {
                          try {
                            await axios.put(
                              `${BASE_URL}/api/tasks/update-status/${task._id}`,
                              { status: e.target.value },
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                              },
                            );
                            fetchTasksForProject(selectedProject._id);
                            fetchProgress();
                          } catch (err) {
                            Swal.fire(
                              "Error",
                              err.response?.data?.msg || "Status update failed",
                              "error",
                            );
                          }
                        }}
                        className="appearance-none w-7 h-7 rounded-full border-0 bg-transparent cursor-pointer text-transparent focus:outline-none"
                        title={`Status: ${task.status}`}
                        style={{ colorScheme: "light" }}
                      >
                        {(
                          task.allowedStatuses || [
                            "Pending",
                            "In Progress",
                            "Completed",
                          ]
                        ).map((s) => (
                          <option
                            key={s}
                            value={s}
                            className="text-gray-700 bg-white"
                          >
                            {s}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {task.status ===
                        task.allowedStatuses?.[
                          task.allowedStatuses.length - 1
                        ] ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : task.status ===
                          (task.allowedStatuses?.[0] || "Pending") ? (
                          <Circle size={18} className="text-gray-300" />
                        ) : (
                          <Clock size={18} className="text-blue-500" />
                        )}
                      </div>
                    </div>

                    {/* TASK INFO */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${task.status === task.allowedStatuses?.[task.allowedStatuses.length - 1] ? "line-through text-gray-400" : "text-gray-700"}`}
                      >
                        {task.title}
                      </p>

                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {task.assignedTo?.length > 0 &&
                          task.assignedTo.map((member) => (
                            <span
                              key={member._id}
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"
                            >
                              <Users size={9} /> {member.name}
                            </span>
                          ))}

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            task.status ===
                            task.allowedStatuses?.[
                              task.allowedStatuses.length - 1
                            ]
                              ? "bg-green-50 text-green-600"
                              : task.status ===
                                  (task.allowedStatuses?.[0] || "Pending")
                                ? "bg-gray-100 text-gray-500"
                                : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* TASK ACTIONS */}
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover/task:opacity-100 transition shrink-0">
                      {can("tasks", "update") && (
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            const memberIds = (task.assignedTo || []).map(
                              (m) => m._id || m,
                            );
                            const allMembers =
                              selectedProject.members?.map((m) => m._id) || [];
                            const isAll =
                              allMembers.length > 0 &&
                              allMembers.every((id) => memberIds.includes(id));
                            setTaskForm({
                              title: task.title,
                              description: task.description || "",
                              assignedTo: memberIds,
                              assignAll: isAll,
                              status: task.status,
                              allowedStatuses: task.allowedStatuses || [
                                "Pending",
                                "In Progress",
                                "Completed",
                              ],
                            });
                            setShowTaskForm(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                      )}

                      {can("tasks", "delete") && (
                        <button
                          onClick={async () => {
                            const r = await Swal.fire({
                              title: "Delete task?",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Delete",
                            });
                            if (!r.isConfirmed) return;
                            try {
                              await axios.delete(
                                `${BASE_URL}/api/tasks/delete/${task._id}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                  },
                                },
                              );
                              fetchTasksForProject(selectedProject._id);
                              fetchProgress();
                            } catch (err) {
                              Swal.fire("Error", "Delete failed", "error");
                              console.log(err);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
