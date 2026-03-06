import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProjects = () => {
    axios
      .get(`${BASE_URL}/api/projects/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data.data))
      .catch(() => alert("Failed to load projects"));
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
    } catch {
      Swal.fire("Error", "Status update failed", "error");
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
        <div className="bg-white rounded-3xl shadow-sm border p-10 text-center">
          <p className="text-lg font-semibold text-neutral-700">
            No assigned projects yet
          </p>
          <p className="text-neutral-500 mt-1">
            Your manager will assign projects soon.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p._id}
              className="group relative bg-white rounded-3xl border border-neutral-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col gap-4 overflow-hidden"
            >
              {/* TOP COLOR BAR */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition" />

              {/* HEADER */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold shadow">
                    {p.title?.charAt(0)}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-blue-600 transition">
                      {p.title}
                    </h3>

                    {p.deadline && (
                      <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                        ⏳ {new Date(p.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* STATUS BADGE */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${statusColor(
                    p.status || "Pending",
                  )}`}
                >
                  {p.status || "Pending"}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                {p.description}
              </p>

              {/* STATUS UPDATE SECTION */}
              {/* STATUS UPDATE SECTION */}
              <div className="pt-4 border-t">
                <p className="text-xs text-neutral-400 mb-2 tracking-wide">
                  UPDATE STATUS
                </p>

                {(() => {
                  let allowedStatuses = [];

                  if (p.status == "On Hold") {
                    allowedStatuses = ["On Hold"];
                  }

                  if (p.status == "Canceled") {
                    allowedStatuses = ["Canceled"];
                  }

                  if (p.status !== "On Hold" && p.status !== "Canceled") {
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
                        className="w-full appearance-none border rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none pr-8"
                      >
                        {allowedStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        ▾
                      </div>
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
