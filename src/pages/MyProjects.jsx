import { useEffect, useState } from "react";
import axios from "../utils/axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import {
  CalendarClock,
  FolderKanban,
  ChevronDown,
  ListTodo,
  CheckCircle2,
  Circle,
  Clock,
  X,
  Users,
} from "lucide-react";
import { getRoleFromToken } from "../utils/jwt";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProjects = () => {
    const role = getRoleFromToken();
    // If client contact, fetch company projects
    if (role === "ClientContact") {
      axios
        .get(`${BASE_URL}/api/projects/company-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setProjects(res.data.data))
        .catch((err) =>
          Swal.fire(
            "Error",
            err.response?.data?.msg ||
              err.response?.data?.message ||
              "Failed to load projects",
            "error",
          ),
        );
    } else {
      axios
        .get(`${BASE_URL}/api/projects/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setProjects(res.data.data))
        .catch((err) =>
          Swal.fire(
            "Error",
            err.response?.data?.message || "Failed to load projects",
            "error",
          ),
        );
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tasks/progress-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgressMap(res.data.data);
    } catch (err) {
      console.log(err);

      // silent
    }
  };

  const fetchTasksForProject = async (projectId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/tasks/my-tasks/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProjectTasks(res.data.data);
    } catch (err) {
      console.log(err);

      setProjectTasks([]);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchProgress();
  }, []);

  /* Employee allowed statuses */

  // const allowedStatuses = ["In Progress", "Coding", "Testing", "Completed"];

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${BASE_URL}/api/projects/update-status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.fire("Updated", "Project status updated", "success");
      fetchProjects();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Status update failed",
        "error",
      );
    }
  };

  const statusColor = (status) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Assigned") return "bg-blue-100 text-blue-700";
    if (status === "In Progress") return "bg-purple-100 text-purple-700";
    if (status === "Under Review") return "bg-orange-100 text-orange-700";
    if (status === "Completed") return "bg-green-100 text-green-700";
    if (status === "Coding") return "bg-red-100 text-red-700";
    if (status === "Testing") return "bg-green-100 text-green-300";
    return "bg-red-100 text-red-700";
  };

  return (
    <PageLayout title="Assigned Projects" showBackButton>
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FolderKanban size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">
            No assigned projects yet
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Your manager will assign projects soon.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {projects.map((p) => (
            <div
              key={p._id}
              className="group relative bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col gap-3 overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedProject(p);
                fetchTasksForProject(p._id);
              }}
            >
              {/* TOP COLOR BAR */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition" />

              {/* HEADER */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {p.title?.charAt(0)}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition">
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

                {/* STATUS BADGE */}
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${statusColor(
                    p.status || "Pending",
                  )}`}
                >
                  {p.status || "Pending"}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                {p.description}
              </p>

              {/* PROGRESS BAR */}
              {(() => {
                const prog = progressMap[p._id];
                if (!prog || prog.total === 0) return null;
                return (
                  <div>
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

              {/* STATUS UPDATE SECTION */}
              <div
                className="pt-3 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-semibold">
                  Update Status
                </p>

                {(() => {
                  let allowedStatuses = [];

                  if (p.status == "On Hold") {
                    allowedStatuses = ["On Hold"];
                  }

                  if (p.status == "Cancelled") {
                    allowedStatuses = ["Cancelled"];
                  }

                  if (p.status !== "On Hold" && p.status !== "Cancelled") {
                    allowedStatuses = [
                      "In Progress",
                      "Coding",
                      "Testing",
                      "Completed",
                    ];
                  }

                  return (
                    <div className="relative">
                      <select
                        value={p.status || "Pending"}
                        onChange={(e) => updateStatus(p._id, e.target.value)}
                        className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all pr-8"
                      >
                        {allowedStatuses.map((s) => (
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
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TASK DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full sm:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col">
            {/* HEADER */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-semibold text-sm shrink-0">
                  {selectedProject.title?.charAt(0)}
                </div>
                <h2 className="text-base font-semibold truncate">
                  {selectedProject.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setProjectTasks([]);
                }}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-5 overflow-y-auto flex-1">
              {/* PROGRESS BAR */}
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

              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <ListTodo size={16} /> My Tasks
              </h3>

              {projectTasks.length === 0 ? (
                <div className="text-center py-8">
                  <ListTodo size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    No tasks assigned to you
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectTasks.map((task) => {
                    const statuses = task.allowedStatuses || [
                      "Pending",
                      "In Progress",
                      "Completed",
                    ];
                    const lastStatus = statuses[statuses.length - 1];
                    const firstStatus = statuses[0];

                    return (
                      <div
                        key={task._id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-colors"
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
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                fetchTasksForProject(selectedProject._id);
                                fetchProgress();
                              } catch (err) {
                                Swal.fire(
                                  "Error",
                                  err.response?.data?.msg ||
                                    "Status update failed",
                                  "error",
                                );
                              }
                            }}
                            className="appearance-none w-7 h-7 rounded-full border-0 bg-transparent cursor-pointer text-transparent focus:outline-none"
                            title={`Status: ${task.status}`}
                          >
                            {statuses.map((s) => (
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
                            {task.status === lastStatus ? (
                              <CheckCircle2
                                size={18}
                                className="text-green-500"
                              />
                            ) : task.status === firstStatus ? (
                              <Circle size={18} className="text-gray-300" />
                            ) : (
                              <Clock size={18} className="text-blue-500" />
                            )}
                          </div>
                        </div>

                        {/* TASK INFO */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${task.status === lastStatus ? "line-through text-gray-400" : "text-gray-700"}`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                task.status === lastStatus
                                  ? "bg-green-50 text-green-600"
                                  : task.status === firstStatus
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setProjectTasks([]);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
