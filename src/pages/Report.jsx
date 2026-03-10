import { useState, useEffect } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import {
  FileBarChart,
  Clock,
  FolderKanban,
  Users,
  Calendar,
  User,
  Download,
  X,
  Loader2,
  AlertCircle,
  Rocket,
} from "lucide-react";

export default function Reports() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    type: "project",
    employeeId: "all",
  });

  const [employees, setEmployees] = useState([]);

  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [showModal, setShowModal] = useState(false);

  /* ---------- FETCH EMPLOYEES ---------- */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/employees/view`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("Full API Response:", res.data);

        if (res.data.data && Array.isArray(res.data.data)) {
          // Filter for employees only
          let empList = res.data.data.filter((emp) => {
            return (
              emp.Designation === "Employee" ||
              emp.Designation === "employee" ||
              emp.designation === "Employee" ||
              emp.designation === "employee"
            );
          });

          // If no employees found with filter, show all non-admin employees
          if (empList.length === 0) {
            empList = res.data.data.filter((emp) => {
              return (
                emp.Designation !== "Super Admin" &&
                emp.Designation !== "Admin" &&
                emp.designation !== "Super Admin" &&
                emp.designation !== "Admin"
              );
            });
          }

          // console.log("Filtered Employees List:", empList);
          setEmployees(empList);
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    if (token) {
      fetchEmployees();
    }
  }, [token]);

  /* ---------- CHANGE HANDLER ---------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ---------- GENERATE REPORT ---------- */
  const generateReport = async () => {
    if (!form.startDate || !form.endDate) {
      return Swal.fire("Error", "Please select date range", "error");
    }

    try {
      setLoading(true);

      if (form.type === "attendance") {
        // For attendance report, call the attendance endpoint directly
        const res = await axios.post(
          `${BASE_URL}/api/reports/attendance/generate`,
          {
            startDate: form.startDate,
            endDate: form.endDate,
            employeeId: form.employeeId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.data.success) {
          setReportData(res.data.data);
          setShowModal(true);
          setLoading(false);
        }
      } else {
        // For project and employee reports, use the original flow
        const res = await axios.post(`${BASE_URL}/api/reports/create`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReportId(res.data.reportId);
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to generate report",
        "error",
      );
      setLoading(false);
    }
  };

  /* ---------- DOWNLOAD ATTENDANCE REPORT AS CSV ---------- */
  const downloadAttendanceCSV = () => {
    if (reportData.length === 0) return;

    // Create CSV content
    let csv =
      "Employee Name,Email,Designation,Department,Date,First Check-In,Last Check-Out,Total Hours\n";

    reportData.forEach((row) => {
      csv += `"${row.name}","${row.email}","${row.designation}","${row.department}","${row.date}","${row.firstCheckIn}","${row.lastCheckOut}",${row.totalHours}\n`;
    });

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance-report-${date}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire("Success", "Report downloaded successfully", "success");
  };

  /* ---------- POLLING ---------- */
  useEffect(() => {
    if (!reportId) return;

    const interval = setInterval(async () => {
      const res = await axios.get(`${BASE_URL}/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "Completed") {
        setReportData(res.data.data);
        setDownloadUrl(res.data.downloadUrl);
        setShowModal(true);
        setLoading(false);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reportId, token]);

  return (
    <PageLayout title="Reports">
      <div className="space-y-8">
        {/* FORM SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <FileBarChart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Generate Report
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Select parameters to create your customized report
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* REPORT TYPE */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-2.5 block uppercase tracking-wider">
                Report Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "attendance", label: "Attendance", icon: Clock },
                  { value: "project", label: "Projects", icon: FolderKanban },
                  { value: "employee", label: "Employees", icon: Users },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setForm({ ...form, type: option.value })}
                      className={`p-4 rounded-xl font-medium transition border flex flex-col items-center gap-2 text-sm ${
                        form.type === option.value
                          ? "border-blue-600 bg-blue-600 text-white shadow-md"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DATE RANGE */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2.5 block uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2.5 block uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
              />
            </div>

            {/* EMPLOYEE DROPDOWN - ONLY FOR ATTENDANCE REPORT */}
            {form.type === "attendance" && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-2.5 block uppercase tracking-wider">
                  Select Employee ({employees.length})
                </label>
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                >
                  <option value="all">All Employees</option>
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} - {emp.email}
                      </option>
                    ))
                  ) : (
                    <option disabled>No employees found</option>
                  )}
                </select>
                {employees.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> No employees loaded. Please
                    refresh the page.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* GENERATE BUTTON */}
          <button
            disabled={loading}
            onClick={generateReport}
            className="w-full mt-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Rocket size={18} />
                Generate Report
              </>
            )}
          </button>

          {loading && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-blue-600 text-sm font-medium flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Report is being generated... This may take a few moments.
              </p>
              <div className="mt-2 w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full animate-pulse w-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- MODAL ---------- */}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-linear-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                {form.type === "attendance" ? (
                  <Clock size={20} />
                ) : form.type === "project" ? (
                  <FolderKanban size={20} />
                ) : (
                  <Users size={20} />
                )}
                <div>
                  <h2 className="font-semibold text-base">
                    {form.type === "attendance"
                      ? "Attendance Report"
                      : form.type === "project"
                        ? "Project Report"
                        : "Employee Report"}
                  </h2>
                  <p className="text-blue-100 text-xs">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50">
              {reportData.length === 0 ? (
                <div className="text-center py-12">
                  <FileBarChart
                    size={32}
                    className="text-gray-300 mx-auto mb-3"
                  />
                  <p className="text-gray-500 text-sm font-medium">
                    No data found
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              ) : form.type === "attendance" ? (
                // ATTENDANCE REPORT TABLE
                <div className="overflow-x-auto">
                  {reportData.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-500">
                      No records found
                    </div>
                  ) : (
                    <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
                      <thead className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="p-3 text-left text-xs font-semibold">
                            Employee Name
                          </th>
                          <th className="p-3 text-left text-xs font-semibold">
                            Email
                          </th>
                          <th className="p-3 text-left text-xs font-semibold">
                            Designation
                          </th>
                          <th className="p-3 text-left text-xs font-semibold">
                            Department
                          </th>
                          <th className="p-3 text-center text-xs font-semibold">
                            Date
                          </th>
                          <th className="p-3 text-center text-xs font-semibold">
                            Check-In
                          </th>
                          <th className="p-3 text-center text-xs font-semibold">
                            Check-Out
                          </th>
                          <th className="p-3 text-center text-xs font-semibold">
                            Total Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportData.map((r, i) => (
                          <tr
                            key={i}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/50 transition`}
                          >
                            <td className="p-3 font-medium text-sm text-gray-800">
                              {r.name}
                            </td>
                            <td className="p-3 text-sm text-gray-500">
                              {r.email}
                            </td>
                            <td className="p-3">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">
                                {r.designation}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-500">
                              {r.department}
                            </td>
                            <td className="p-3 text-center text-sm">
                              {r.date}
                            </td>
                            <td className="p-3 text-center text-sm">
                              {r.firstCheckIn}
                            </td>
                            <td className="p-3 text-center text-sm">
                              {r.lastCheckOut}
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                                {r.totalHours}h
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                // PROJECT / EMPLOYEE REPORT TABLE
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-linear-to-r from-blue-600 to-indigo-600 text-white sticky top-0">
                      <tr>
                        {form.type === "project" ? (
                          <>
                            <th className="p-3 text-left text-xs font-semibold">
                              Project Title
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Description
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Status
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Deadline
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Created
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Members
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="p-3 text-left text-xs font-semibold">
                              Name
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Email
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Phone
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Department
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Designation
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Salary
                            </th>
                            <th className="p-3 text-left text-xs font-semibold">
                              Join Date
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {reportData.map((r, i) => (
                        <tr
                          key={i}
                          className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/50 transition`}
                        >
                          {form.type === "project" ? (
                            <>
                              <td className="p-3 font-medium text-sm text-gray-800">
                                {r.title}
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {(r.description || "-").substring(0, 50)}...
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === "Active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                  {r.status}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {r.deadline
                                  ? new Date(r.deadline).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {Array.isArray(r.members)
                                  ? r.members.slice(0, 2).join(", ") +
                                    (r.members.length > 2 ? "..." : "")
                                  : "-"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 font-medium text-sm text-gray-800">
                                {r.name}
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {r.email}
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {r.phone}
                              </td>
                              <td className="p-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">
                                  {r.department}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                                  {r.designation}
                                </span>
                              </td>
                              <td className="p-3 font-medium text-sm text-green-600">
                                ₹{r.salary}
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {r.joinDate
                                  ? new Date(r.joinDate).toLocaleDateString()
                                  : "-"}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex gap-3 flex-wrap">
                {downloadUrl && (
                  <a
                    href={`${BASE_URL}${downloadUrl}`}
                    className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:shadow-md transition font-medium text-sm"
                    download
                  >
                    <Download size={16} /> Download Report
                  </a>
                )}

                {form.type === "attendance" && reportData.length > 0 && (
                  <button
                    onClick={downloadAttendanceCSV}
                    className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:shadow-md transition font-medium text-sm"
                  >
                    <Download size={16} /> Download CSV
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition text-sm font-medium"
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
