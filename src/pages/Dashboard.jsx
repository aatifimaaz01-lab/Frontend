import { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import {
  Users,
  FolderKanban,
  IndianRupee,
  Building2,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  CalendarClock,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalProjects: 0,
    totalSalary: 0,
    departments: {},
    projects: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${BASE_URL}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) setSummary(res.data.data);
      })
      .catch(() => {});
  }, []);

  const deptData = Object.entries(summary.departments);

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-8">
        {/* ---------- HERO SECTION ---------- */}
        <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-8 md:p-10 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-200" />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
                Overview
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Dashboard</h2>
            <p className="text-blue-100 mt-2 text-sm md:text-base">
              Manage employees, projects, and track key metrics
            </p>
          </div>
        </div>

        {/* ---------- STATS ---------- */}
        <div className="grid md:grid-cols-3 gap-5 stagger-children">
          <StatCard
            title="Total Employees"
            value={summary.totalEmployees}
            subtitle={`${summary.totalEmployees} team members`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Total Projects"
            value={summary.totalProjects}
            subtitle={`${summary.totalProjects} active projects`}
            icon={FolderKanban}
            color="purple"
          />
          <StatCard
            title="Total Salary"
            value={`₹${summary.totalSalary.toLocaleString()}`}
            subtitle="Monthly payroll"
            icon={IndianRupee}
            color="green"
          />
        </div>

        {/* ---------- DEPARTMENT ---------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Department Distribution
            </h2>
          </div>

          {deptData.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">
              No department data available
            </p>
          ) : (
            <div className="space-y-5">
              {deptData.map(([dept, count], idx) => {
                const colors = [
                  {
                    bar: "from-blue-500 to-blue-600",
                    badge: "bg-blue-50 text-blue-700",
                  },
                  {
                    bar: "from-violet-500 to-purple-600",
                    badge: "bg-violet-50 text-violet-700",
                  },
                  {
                    bar: "from-emerald-500 to-green-600",
                    badge: "bg-emerald-50 text-emerald-700",
                  },
                  {
                    bar: "from-amber-500 to-orange-600",
                    badge: "bg-amber-50 text-amber-700",
                  },
                  {
                    bar: "from-cyan-500 to-teal-600",
                    badge: "bg-cyan-50 text-cyan-700",
                  },
                ];
                const color = colors[idx % colors.length];
                const percentage = summary.totalEmployees
                  ? (count / summary.totalEmployees) * 100
                  : 0;

                return (
                  <div key={dept}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700 text-sm">
                        {dept}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color.badge}`}
                      >
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-linear-to-r ${color.bar} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------- DEADLINES ---------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <CalendarClock size={18} className="text-violet-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Upcoming Deadlines
            </h2>
            <span className="ml-auto bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold">
              {summary.projects.length} Projects
            </span>
          </div>

          {summary.projects.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {summary.projects.map((p) => {
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
                  overdue: "border-red-200 bg-red-50/50",
                  urgent: "border-amber-200 bg-amber-50/50",
                  normal: "border-gray-200 bg-gray-50/50",
                };

                const urgencyIcon = {
                  overdue: <AlertTriangle size={16} className="text-red-500" />,
                  urgent: <Flame size={16} className="text-amber-500" />,
                  normal: (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ),
                };

                const urgencyBadge = {
                  overdue: "bg-red-100 text-red-700",
                  urgent: "bg-amber-100 text-amber-700",
                  normal: "bg-emerald-100 text-emerald-700",
                };

                return (
                  <div
                    key={p._id}
                    className={`rounded-xl px-5 py-4 flex justify-between items-center border hover:shadow-md transition-shadow ${urgencyStyles[urgency] || urgencyStyles.normal}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        {urgencyIcon[urgency] || urgencyIcon.normal}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {p.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Project deadline
                        </p>
                      </div>
                    </div>

                    {deadline ? (
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgencyBadge[urgency]}`}
                        >
                          {urgency === "overdue"
                            ? "Overdue"
                            : urgency === "urgent"
                              ? "Urgent"
                              : "On Track"}
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          {deadline.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {daysLeft !== null && (
                          <span className="text-[11px] text-gray-400">
                            {Math.abs(daysLeft)} day
                            {Math.abs(daysLeft) !== 1 ? "s" : ""}{" "}
                            {daysLeft < 0 ? "ago" : "left"}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                        No deadline
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

/* ---------- STAT CARD ---------- */

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorMap = {
    blue: {
      bg: "bg-blue-600",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accent: "bg-blue-500",
    },
    purple: {
      bg: "bg-violet-600",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accent: "bg-violet-500",
    },
    green: {
      bg: "bg-emerald-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "bg-emerald-500",
    },
  };

  const c = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}
        >
          <Icon size={20} className={c.iconColor} />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-1">{value}</h2>
      <p className="text-sm text-gray-400">{subtitle}</p>

      <div className={`h-1 w-16 rounded-full ${c.accent} mt-4 opacity-60`} />
    </div>
  );
}
