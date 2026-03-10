import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { BASE_URL } from "../config";
import Swal from "sweetalert2";
import EmployeeForm from "../components/EmployeeForm";
import { usePermissions } from "../context/PermissionContext";
import { hasPermission } from "../utils/permissions";
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  X,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  IndianRupee,
  Star,
  Download,
  UserX,
} from "lucide-react";

export default function EmployeeList() {
  const { permissions } = usePermissions();
  const can = (page, action) => hasPermission(permissions, page, action);
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
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to generate offer letter",
        "error",
      );
    }
  };

  useEffect(() => {
    if (!hasPermission(permissions, "employees", "view")) {
      navigate("/profile");
    }
  }, [navigate, permissions]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/employees/view`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to load employees",
        "error",
      );
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

      Swal.fire("Deleted!", "Employee deleted successfully", "success");
      fetchEmployees();
      setSelectedEmployee(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete employee";
      Swal.fire("Error", msg, "error");
    }
  };

  const filtered = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageLayout title="Employees">
      {/* HEADER */}
      <div className="flex flex-col gap-5 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-fit flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 md:flex-none md:w-96">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search employee by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all"
            />
          </div>

          {can("employees", "create") && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold flex items-center justify-center gap-2 text-sm"
            >
              <UserPlus size={18} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">
                  Employee
                </th>
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">
                  Email
                </th>
                <th className="text-left py-4 px-6 font-semibold uppercase tracking-wider text-xs">
                  Department
                </th>
                <th className="text-right py-4 px-6 font-semibold uppercase tracking-wider text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr
                  key={emp._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                        {emp.name?.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {emp.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-500">{emp.email}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {emp.Department}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => getOfferLetter(emp._id)}
                        className="p-2 rounded-lg text-violet-600 hover:bg-violet-50 transition-colors"
                        title="Offer Letter"
                      >
                        <FileText size={16} />
                      </button>

                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {can("employees", "update") && (
                        <button
                          onClick={() => {
                            setEditEmployee(emp);
                            setShowEdit(true);
                          }}
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {can("employees", "delete") && (
                        <button
                          onClick={() => deleteEmployee(emp._id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <UserX size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No employees found</p>
          </div>
        )}
      </div>
      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3 stagger-children">
        {filtered.map((emp) => (
          <div
            key={emp._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                  {emp.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {emp.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                </div>
                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
                  {emp.Department}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => getOfferLetter(emp._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-violet-50 text-violet-600 py-2 rounded-lg text-xs hover:bg-violet-100 transition-colors font-medium"
                >
                  <FileText size={14} /> Offer
                </button>

                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs hover:bg-blue-100 transition-colors font-medium"
                >
                  <Eye size={14} /> View
                </button>

                {can("employees", "update") && (
                  <button
                    onClick={() => {
                      setEditEmployee(emp);
                      setShowEdit(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 py-2 rounded-lg text-xs hover:bg-emerald-100 transition-colors font-medium"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}

                {can("employees", "delete") && (
                  <button
                    onClick={() => deleteEmployee(emp._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-lg text-xs hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <UserX size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No employees found</p>
          </div>
        )}
      </div>
      {/* VIEW MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* HEADER */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur">
                    {selectedEmployee.name?.charAt(0)}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedEmployee.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-blue-100 text-sm mt-1">
                      <Mail size={14} /> {selectedEmployee.email}
                    </div>
                    <div className="flex items-center gap-3 text-blue-200 text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {selectedEmployee.Department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} /> {selectedEmployee.Designation}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6">
              {/* CONTACT INFO */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" /> Contact
                  Information
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Info
                    label="Phone"
                    value={selectedEmployee.phone_no}
                    icon={<Phone size={14} />}
                  />
                  <Info
                    label="Designation"
                    value={selectedEmployee.Designation}
                    icon={<Briefcase size={14} />}
                  />
                  <Info
                    label="Salary"
                    value={`₹${selectedEmployee.salary?.toLocaleString()}`}
                    icon={<IndianRupee size={14} />}
                  />
                  <Info
                    label="Email"
                    value={selectedEmployee.email}
                    icon={<Mail size={14} />}
                  />
                </div>
              </div>

              {/* SKILLS */}
              {selectedEmployee.skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star size={16} className="text-gray-400" /> Skills &
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end items-center p-4 border-t border-gray-100 gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>

              {can("employees", "update") && (
                <button
                  onClick={() => {
                    setEditEmployee(selectedEmployee);
                    setShowEdit(true);
                    setSelectedEmployee(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>
              )}

              {can("employees", "delete") && (
                <button
                  onClick={() => {
                    deleteEmployee(selectedEmployee._id);
                    setSelectedEmployee(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn">
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus size={20} /> Add New Employee
                </h2>
                <p className="text-white/70 text-sm mt-1">
                  Fill in the details to add a new team member
                </p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
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
                  } catch (err) {
                    Swal.fire(
                      "Error",
                      err.response?.data?.message || "Failed to add employee",
                      "error",
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* EDIT EMPLOYEE MODAL */}
      {showEdit && editEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scaleIn">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Pencil size={20} /> Edit Employee
                </h2>
                <p className="text-white/70 text-sm mt-1">
                  Update {editEmployee.name}'s information
                </p>
              </div>
              <button
                onClick={() => setShowEdit(false)}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
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
                  } catch (err) {
                    Swal.fire(
                      "Error",
                      err.response?.data?.message || "Update failed",
                      "error",
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      {showOffer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="bg-linear-to-r from-violet-600 to-indigo-600 text-white px-6 py-5 flex justify-between items-center border-b">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FileText size={20} /> Offer Letter
                </h2>
                <p className="text-white/70 text-sm mt-0.5">
                  Employee offer letter document
                </p>
              </div>

              <button
                onClick={() => setShowOffer(false)}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* PDF Preview */}
            <iframe
              src={offerUrl}
              title="Offer Letter"
              className="flex-1 w-full"
            />

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setShowOffer(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
              <a
                href={offerUrl}
                download="OfferLetter.pdf"
                className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="font-semibold text-gray-900 text-sm">{value || "—"}</p>
    </div>
  );
}
