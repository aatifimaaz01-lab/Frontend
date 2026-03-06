import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${BASE_URL}/api/employees/view`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEmployees(res.data.data || []));

    axios
      .get(`${BASE_URL}/api/projects/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data.data || []));
  }, []);

  const totalSalary = employees.reduce(
    (sum, e) => sum + Number(e.salary || 0),
    0,
  );

  const deptMap = {};
  employees.forEach((e) => {
    deptMap[e.Department] = (deptMap[e.Department] || 0) + 1;
  });

  const deptData = Object.entries(deptMap);

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-10">
        {/* ---------- HERO SECTION ---------- */}
        <div className="relative bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">
              Welcome to
            </h3>
            <h2 className="text-4xl font-bold mt-2">Dashboard Overview</h2>
            <p className="text-white/80 mt-2">
              Manage employees, projects, and track key metrics
            </p>
          </div>
        </div>

        {/* ---------- STATS ---------- */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            title="Total Employees"
            value={employees.length}
            subtitle={`${employees.length} team members`}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total Projects"
            value={projects.length}
            subtitle={`${projects.length} active projects`}
            icon="📊"
            color="purple"
          />
          <StatCard
            title="Total Salary"
            value={`₹${totalSalary.toLocaleString()}`}
            subtitle="Monthly payroll"
            icon="💰"
            color="green"
          />
        </div>

        {/* ---------- DEPARTMENT ---------- */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg">
              🏢
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Department Distribution
            </h2>
          </div>

          {deptData.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              No department data available
            </p>
          ) : (
            <div className="space-y-7 relative z-10">
              {deptData.map(([dept, count], idx) => {
                const colors = [
                  {
                    bar: "from-blue-500 to-indigo-600",
                    badge: "bg-blue-100 text-blue-700",
                  },
                  {
                    bar: "from-purple-500 to-pink-600",
                    badge: "bg-purple-100 text-purple-700",
                  },
                  {
                    bar: "from-green-500 to-emerald-600",
                    badge: "bg-green-100 text-green-700",
                  },
                  {
                    bar: "from-orange-500 to-red-600",
                    badge: "bg-orange-100 text-orange-700",
                  },
                  {
                    bar: "from-cyan-500 to-blue-600",
                    badge: "bg-cyan-100 text-cyan-700",
                  },
                ];
                const color = colors[idx % colors.length];
                const percentage = (count / employees.length) * 100;

                return (
                  <div key={dept} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-800">
                        {dept}
                      </span>
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-full ${color.badge}`}
                      >
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
                      <div
                        className={`bg-linear-to-r ${color.bar} h-3 rounded-full transition-all duration-700 group-hover:shadow-lg`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------- DEADLINES ---------- */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30" />

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-lineat-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg">
              ⏰
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming Deadlines
            </h2>
            <span className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
              {projects.length} Projects
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 relative z-10">
              <p className="text-neutral-500 text-lg">📭 No projects yet</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {projects.slice(0, 5).map((p) => {
                const deadline = p.deadline ? new Date(p.deadline) : null;
                const daysLeft = deadline
                  ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24))
                  : null;
                const urgency =
                  daysLeft !== null
                    ? daysLeft < 0
                      ? "overdue"
                      : daysLeft < 7
                        ? "urgent"
                        : "normal"
                    : null;

                const urgencyStyles = {
                  overdue:
                    "border-red-300 bg-gradient-to-r from-red-50 to-pink-50",
                  urgent:
                    "border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50",
                  normal:
                    "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50",
                };

                const urgencyBadge = {
                  overdue: "bg-red-100 text-red-700",
                  urgent: "bg-orange-100 text-orange-700",
                  normal: "bg-blue-100 text-blue-700",
                };

                return (
                  <div
                    key={p._id}
                    className={`rounded-2xl px-6 py-5 flex justify-between items-center border-2 hover:shadow-lg hover:scale-105 transition transform cursor-default ${urgencyStyles[urgency] || urgencyStyles.normal}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl mt-1">📌</div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          {p.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Project deadline
                        </p>
                      </div>
                    </div>

                    {deadline ? (
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${urgencyBadge[urgency]}`}
                        >
                          {urgency === "overdue"
                            ? "⚠️ Overdue"
                            : urgency === "urgent"
                              ? "🔥 Urgent"
                              : "✓ On Track"}
                        </span>
                        <span className="text-sm font-bold text-gray-700">
                          {deadline.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {daysLeft !== null && (
                          <span className="text-xs text-gray-500">
                            {Math.abs(daysLeft)} day
                            {Math.abs(daysLeft) !== 1 ? "s" : ""}{" "}
                            {daysLeft < 0 ? "ago" : "left"}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg font-medium">
                        No deadline set
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

/* ---------- PREMIUM STAT CARD ---------- */

function StatCard({ title, value, subtitle, icon, color }) {
  const colorMap = {
    blue: {
      bg: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-200",
      light: "bg-blue-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-700",
    },
    purple: {
      bg: "from-purple-500 to-indigo-600",
      glow: "shadow-purple-200",
      light: "bg-purple-50",
      border: "border-purple-200",
      badge: "bg-purple-100 text-purple-700",
    },
    green: {
      bg: "from-green-500 to-emerald-600",
      glow: "shadow-green-200",
      light: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-700",
    },
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 bg-white ${colorMap[color].border} shadow-lg hover:shadow-2xl p-8 transition transform hover:scale-105 group`}
    >
      <div
        className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl opacity-40 ${colorMap[color].light} group-hover:opacity-60 transition`}
      />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">
            {title}
          </span>
          <span className="text-3xl">{icon}</span>
        </div>

        <h2 className="text-5xl font-bold tracking-tight text-gray-900 my-3">
          {value}
        </h2>

        <p className="text-sm text-gray-600 mb-5">{subtitle}</p>

        <div
          className={`h-2 w-20 rounded-full bg-linear-to-r ${colorMap[color].bg} shadow-lg`}
        />
      </div>
    </div>
  );
}
