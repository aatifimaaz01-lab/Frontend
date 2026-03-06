import { useState, useEffect } from "react";
import axios from "axios";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";

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
      Swal.fire("Error", "Failed to generate report", err);
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
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl shadow-lg border border-blue-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl">
              📋
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Generate Report
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Select parameters to create your customized report
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* REPORT TYPE */}
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-800 mb-3 block uppercase tracking-wide">
                📊 Report Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "attendance", label: "Attendance", icon: "🕐" },
                  { value: "project", label: "Projects", icon: "📁" },
                  { value: "employee", label: "Employees", icon: "👥" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setForm({ ...form, type: option.value })}
                    className={`p-4 rounded-xl font-semibold transition border-2 flex flex-col items-center gap-2 ${
                      form.type === option.value
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-400"
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DATE RANGE */}
            <div>
              <label className="text-sm font-bold text-gray-800 mb-3 block uppercase tracking-wide">
                📅 Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-800 mb-3 block uppercase tracking-wide">
                📅 End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* EMPLOYEE DROPDOWN - ONLY FOR ATTENDANCE REPORT */}
            {form.type === "attendance" && (
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-800 mb-3 block uppercase tracking-wide">
                  👤 Select Employee ({employees.length})
                </label>
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                >
                  <option value="all">✓ All Employees</option>
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
                  <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                    ⚠️ No employees loaded. Please refresh the page.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* GENERATE BUTTON */}
          <button
            disabled={loading}
            onClick={generateReport}
            className="w-full mt-8 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:shadow-xl active:scale-[0.98] transition font-bold text-lg uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating Report...
              </>
            ) : (
              <>
                <span>🚀</span>
                Generate Report
              </>
            )}
          </button>

          {loading && (
            <div className="mt-6 p-4 rounded-xl bg-blue-100 border border-blue-300">
              <p className="text-blue-700 font-semibold flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Report is being generated... This may take a few moments.
              </p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- MODAL ---------- */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center px-8 py-6 border-b bg-linear-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {form.type === "attendance"
                    ? "🕐"
                    : form.type === "project"
                      ? "📁"
                      : "👥"}
                </span>
                <div>
                  <h2 className="font-bold text-lg">
                    {form.type === "attendance"
                      ? "Attendance Report"
                      : form.type === "project"
                        ? "Project Report"
                        : "Employee Report"}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition font-bold text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-gray-50">
              {reportData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg font-semibold">
                    📭 No data found
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your filters
                  </p>
                </div>
              ) : form.type === "attendance" ? (
                // ATTENDANCE REPORT TABLE (updated for new backend format)
                <div className="overflow-x-auto">
                  {reportData.length === 0 ? (
                    <div className="text-center py-12 text-lg text-gray-500 font-semibold">
                      📭 No records found
                    </div>
                  ) : (
                    <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                      <thead className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="p-4 text-left font-bold">
                            👤 Employee Name
                          </th>
                          <th className="p-4 text-left font-bold">📧 Email</th>
                          <th className="p-4 text-left font-bold">
                            💼 Designation
                          </th>
                          <th className="p-4 text-left font-bold">
                            🏢 Department
                          </th>
                          <th className="p-4 text-center font-bold">📅 Date</th>
                          <th className="p-4 text-center font-bold">
                            🟢 First Check-In
                          </th>
                          <th className="p-4 text-center font-bold">
                            🔴 Last Check-Out
                          </th>
                          <th className="p-4 text-center font-bold">
                            ⏱️ Total Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.map((r, i) => (
                          <tr
                            key={i}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                          >
                            <td className="p-4 font-semibold text-gray-900">
                              {r.name}
                            </td>
                            <td className="p-4 text-gray-600">{r.email}</td>
                            <td className="p-4">
                              <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                {r.designation}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">
                              {r.department}
                            </td>
                            <td className="p-4 text-center">{r.date}</td>
                            <td className="p-4 text-center">
                              {r.firstCheckIn}
                            </td>
                            <td className="p-4 text-center">
                              {r.lastCheckOut}
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
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
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                  <table className="w-full text-sm">
                    <thead className="bg-linear-to-r from-blue-600 to-indigo-600 text-white sticky top-0">
                      <tr>
                        {form.type === "project" ? (
                          <>
                            <th className="p-4 text-left font-bold">
                              📁 Project Title
                            </th>
                            <th className="p-4 text-left font-bold">
                              📝 Description
                            </th>
                            <th className="p-4 text-left font-bold">
                              📊 Status
                            </th>
                            <th className="p-4 text-left font-bold">
                              📅 Deadline
                            </th>
                            <th className="p-4 text-left font-bold">
                              📍 Created
                            </th>
                            <th className="p-4 text-left font-bold">
                              👥 Members
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="p-4 text-left font-bold">👤 Name</th>
                            <th className="p-4 text-left font-bold">
                              📧 Email
                            </th>
                            <th className="p-4 text-left font-bold">
                              📱 Phone
                            </th>
                            <th className="p-4 text-left font-bold">
                              🏢 Department
                            </th>
                            <th className="p-4 text-left font-bold">
                              💼 Designation
                            </th>
                            <th className="p-4 text-left font-bold">
                              💰 Salary
                            </th>
                            <th className="p-4 text-left font-bold">
                              📅 Join Date
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {reportData.map((r, i) => (
                        <tr
                          key={i}
                          className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                        >
                          {form.type === "project" ? (
                            <>
                              <td className="p-4 font-semibold text-gray-900">
                                {r.title}
                              </td>
                              <td className="p-4 text-gray-600">
                                {(r.description || "-").substring(0, 50)}...
                              </td>
                              <td className="p-4">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${r.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                                >
                                  {r.status}
                                </span>
                              </td>
                              <td className="p-4 text-gray-600">
                                {r.deadline
                                  ? new Date(r.deadline).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="p-4 text-gray-600">
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="p-4 text-gray-600">
                                {Array.isArray(r.members)
                                  ? r.members.slice(0, 2).join(", ") +
                                    (r.members.length > 2 ? "..." : "")
                                  : "-"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 font-semibold text-gray-900">
                                {r.name}
                              </td>
                              <td className="p-4 text-gray-600">{r.email}</td>
                              <td className="p-4 text-gray-600">{r.phone}</td>
                              <td className="p-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                  {r.department}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                  {r.designation}
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-green-600">
                                ₹{r.salary}
                              </td>
                              <td className="p-4 text-gray-600">
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

            <div className="px-8 py-6 border-t bg-linear-to-r from-gray-50 to-blue-50 flex justify-between items-center">
              <div className="flex gap-4 flex-wrap">
                {downloadUrl && (
                  <a
                    href={`${BASE_URL}${downloadUrl}`}
                    className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-bold flex items-center gap-2 active:scale-95"
                    download
                  >
                    📥 Download Report
                  </a>
                )}

                {form.type === "attendance" && reportData.length > 0 && (
                  <button
                    onClick={downloadAttendanceCSV}
                    className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-bold flex items-center gap-2 active:scale-95"
                  >
                    📥 Download CSV
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-xl transition font-bold active:scale-95"
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
