import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import EmployeeForm from "../components/EmployeeForm";
import { getRoleFromToken } from "../utils/jwt";

export default function EmployeeList() {
  const role = getRoleFromToken();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const [showOffer, setShowOffer] = useState(false);
  const [offerUrl, setOfferUrl] = useState(null);

  const getOfferLetter = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios
        .get(`${BASE_URL}/api/auth/offer-letter/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        })
        .then((res) => {
          const file = new Blob([res.data], { type: "application/pdf" });
          const url = URL.createObjectURL(file);
          setShowOffer(true);
          setOfferUrl(url);
        });
    } catch {
      alert("Failed to generate offer letter");
    }
  };

  useEffect(() => {
    if (role?.trim().toLowerCase() === "employee") {
      navigate("/profile");
    }
  }, [navigate, role]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/employees/view`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const deleteEmployee = async (id) => {
    const result = await Swal.fire({
      title: "Delete employee?",
      text: "This cannot be undone.",
      icon: "warning",
      customClass: {
        popup: "compact-popup",
        icon: "swal-small-icon",
        title: "swal-small-title",
        htmlContainer: "swal-small-text",
      },
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/api/employees/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchEmployees();
      setSelectedEmployee(null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const filtered = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageLayout title="Employees">
      {/* HEADER */}
      <div className="flex flex-col gap-5 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-fit px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-medium transition"
        >
          ← Back
        </button>

        <div className="relative bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">
              Team Management
            </h3>
            <h2 className="text-3xl font-bold mt-2">Employees Directory</h2>
            <p className="text-white/80 mt-1">
              View and manage all team members
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 md:flex-none md:w-96">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </span>
            <input
              placeholder="Search employee by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pl-12 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>

          {role === "Super Admin" && (
            <button
              onClick={() => setShowAdd(true)}
              className="
    bg-linear-to-r from-green-600 to-emerald-600
    text-white px-6 py-3 rounded-xl shadow-lg
    hover:shadow-xl hover:scale-105
    transition transform font-bold
    flex items-center justify-center gap-2
  "
            >
              ➕ Add Employee
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-blue-50 to-indigo-50 text-gray-700 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-5 px-6 font-bold uppercase tracking-wide text-xs">
                  👤 Employee
                </th>
                <th className="text-left py-5 px-6 font-bold uppercase tracking-wide text-xs">
                  📧 Email
                </th>
                <th className="text-left py-5 px-6 font-bold uppercase tracking-wide text-xs">
                  🏢 Department
                </th>
                <th className="text-right py-5 px-6 font-bold uppercase tracking-wide text-xs">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 transition group"
                >
                  <td className="py-5 px-6 font-bold text-gray-800">
                    {emp.name}
                  </td>
                  <td className="py-5 px-6 text-gray-600">{emp.email}</td>
                  <td className="py-5 px-6">
                    <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold">
                      {emp.Department}
                    </span>
                  </td>

                  <td className="py-5 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {/* OFFER LETTER */}
                      <button
                        onClick={() => getOfferLetter(emp._id)}
                        className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 transition shadow-sm font-bold text-xs title='Offer Letter"
                        title="Offer Letter"
                      >
                        📄
                      </button>

                      {/* VIEW */}
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition shadow-sm font-bold text-xs"
                        title="View Details"
                      >
                        👁️
                      </button>

                      {role === "Super Admin" && (
                        <>
                          {/* EDIT */}
                          <button
                            onClick={() => {
                              setEditEmployee(emp);
                              setShowEdit(true);
                            }}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:scale-110 transition shadow-sm font-bold text-xs"
                            title="Edit"
                          >
                            ✏️
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => deleteEmployee(emp._id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition shadow-sm font-bold text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">😔 No employees found</p>
          </div>
        )}
      </div>
      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {filtered.map((emp) => (
          <div
            key={emp._id}
            className="bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {emp.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.email}</p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-600 font-medium mb-1">
                  Department
                </p>
                <p className="text-sm font-bold text-blue-700">
                  {emp.Department}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => getOfferLetter(emp._id)}
                  className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg text-xs hover:bg-purple-100 transition font-bold border border-purple-200"
                >
                  📄 Offer
                </button>

                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs hover:bg-blue-100 transition font-bold border border-blue-200"
                >
                  👁️ View
                </button>

                {role === "Super Admin" && (
                  <>
                    <button
                      onClick={() => {
                        setEditEmployee(emp);
                        setShowEdit(true);
                      }}
                      className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs hover:bg-green-100 transition font-bold border border-green-200"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => deleteEmployee(emp._id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs hover:bg-red-100 transition font-bold border border-red-200"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">😔 No employees found</p>
          </div>
        )}
      </div>
      {/* VIEW MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 sticky top-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold shadow-lg">
                    {selectedEmployee.name?.charAt(0)}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedEmployee.name}
                    </h2>
                    <p className="text-white/80 text-sm">
                      📧 {selectedEmployee.email}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      🏢 {selectedEmployee.Department} | 💼{" "}
                      {selectedEmployee.Designation}
                    </p>
                  </div>
                </div>

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition w-10 h-10 flex items-center justify-center text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="p-8 space-y-6">
              {/* CONTACT INFO */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📞 Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Info label="📱 Phone" value={selectedEmployee.phone_no} />
                  <Info
                    label="💼 Designation"
                    value={selectedEmployee.Designation}
                  />
                  <Info
                    label="💰 Salary"
                    value={`₹${selectedEmployee.salary?.toLocaleString()}`}
                  />
                  <Info label="📧 Email" value={selectedEmployee.email} />
                </div>
              </div>

              {/* SKILLS */}
              {selectedEmployee.skills?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    ⭐ Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end items-center p-6 border-t bg-gray-50 gap-3 sticky bottom-0">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-bold transition"
              >
                Close
              </button>

              {role === "Super Admin" && (
                <>
                  <button
                    onClick={() => {
                      setEditEmployee(selectedEmployee);
                      setShowEdit(true);
                      setSelectedEmployee(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => {
                      deleteEmployee(selectedEmployee._id);
                      setSelectedEmployee(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition"
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ADD MODAL (unchanged logic) */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <div className="bg-linear-to-r from-green-600 to-emerald-600 text-white p-8 flex justify-between items-center sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">➕ Add New Employee</h2>
                <p className="text-white/80 text-sm mt-1">
                  Fill in the details to add a new team member
                </p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition w-10 h-10 flex items-center justify-center text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <EmployeeForm
                onSubmit={async (data) => {
                  try {
                    const formData = new FormData();
                    Object.keys(data).forEach((k) => {
                      if (k === "documents") {
                        for (let f of data.documents || []) {
                          formData.append("documents", f);
                        }
                      } else if (k === "profilePic") {
                        if (data.profilePic?.length) {
                          formData.append("profilePic", data.profilePic[0]);
                        }
                      } else formData.append(k, data[k]);
                    });

                    await axios.post(
                      `${BASE_URL}/api/employees/insert`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                          "Content-Type": "multipart/form-data",
                        },
                      },
                    );

                    Swal.fire(
                      "Success",
                      "Employee added successfully!",
                      "success",
                    );
                    setShowAdd(false);
                    fetchEmployees();
                  } catch {
                    Swal.fire("Error", "Failed to add employee", "error");
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* EDIT EMPLOYEE MODAL */}
      {showEdit && editEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-8 flex justify-between items-center sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">✏️ Edit Employee</h2>
                <p className="text-white/80 text-sm mt-1">
                  Update {editEmployee.name}'s information
                </p>
              </div>
              <button
                onClick={() => setShowEdit(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition w-10 h-10 flex items-center justify-center text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <EmployeeForm
                initialData={editEmployee}
                onSubmit={async (data) => {
                  try {
                    const formData = new FormData();

                    Object.keys(data).forEach((k) => {
                      if (k === "documents") {
                        for (let f of data.documents || []) {
                          formData.append("documents", f);
                        }
                      } else if (k === "profilePic") {
                        if (data.profilePic?.length) {
                          formData.append("profilePic", data.profilePic[0]);
                        }
                      } else {
                        formData.append(k, data[k]);
                      }
                    });

                    await axios.put(
                      `${BASE_URL}/api/employees/update/${editEmployee._id}`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                          "Content-Type": "multipart/form-data",
                        },
                      },
                    );

                    Swal.fire(
                      "Success",
                      "Employee updated successfully!",
                      "success",
                    );
                    setShowEdit(false);
                    setEditEmployee(null);
                    fetchEmployees();
                  } catch {
                    Swal.fire("Error", "Update failed", "error");
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      {showOffer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 text-white px-8 py-6 flex justify-between items-center border-b">
              <div>
                <h2 className="font-bold text-2xl flex items-center gap-2">
                  📄 Offer Letter
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Employee offer letter document
                </p>
              </div>

              <button
                onClick={() => setShowOffer(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition w-10 h-10 flex items-center justify-center text-xl"
              >
                ✕
              </button>
            </div>

            {/* PDF Preview */}
            <iframe
              src={offerUrl}
              title="Offer Letter"
              className="flex-1 w-full"
            />

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowOffer(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-bold transition"
              >
                Close
              </button>
              <a
                href={offerUrl}
                download="OfferLetter.pdf"
                className="px-6 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition font-bold"
              >
                💾 Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition">
      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="font-bold text-gray-900 text-lg">{value || "—"}</p>
    </div>
  );
}
