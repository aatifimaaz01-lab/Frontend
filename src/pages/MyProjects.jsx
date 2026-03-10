import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import { CalendarClock, FolderKanban, ChevronDown } from "lucide-react";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProjects = () => {
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
  };

  useEffect(() => {
    fetchProjects();
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
    <PageLayout title="Assigned Projects">
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
              className="group relative bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col gap-3 overflow-hidden"
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

              {/* STATUS UPDATE SECTION */}
              <div className="pt-3 border-t border-gray-100">
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
    </PageLayout>
  );
}
