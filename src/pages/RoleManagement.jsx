import { useState, useEffect } from "react";
import { BASE_URL } from "../config";
import PageLayout from "../components/PageLayout";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Pencil, Trash2, Shield, Loader2 } from "lucide-react";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [schema, setSchema] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null); // null = list view, object = editing
  const [formName, setFormName] = useState("");
  const [formPerms, setFormPerms] = useState({});

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  /* ─── Fetch ─── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, schemaRes] = await Promise.all([
        fetch(`${BASE_URL}/api/roles`, { headers }),
        fetch(`${BASE_URL}/api/roles/schema`, { headers }),
      ]);
      const rolesData = await rolesRes.json();
      const schemaData = await schemaRes.json();
      if (rolesData.success) setRoles(rolesData.roles);
      if (schemaData.success) setSchema(schemaData.permissions);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to load roles",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Helpers ─── */
  const openCreate = () => {
    setEditingRole("new");
    setFormName("");
    // Start with no permissions
    const empty = {};
    Object.keys(schema).forEach((page) => (empty[page] = []));
    setFormPerms(empty);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setFormName(role.name);
    // Merge with schema so all pages appear
    const merged = {};
    Object.keys(schema).forEach((page) => {
      const existing =
        role.permissions instanceof Map
          ? role.permissions.get(page)
          : role.permissions?.[page];
      merged[page] = existing || [];
    });
    setFormPerms(merged);
  };

  const toggleAction = (page, action) => {
    setFormPerms((prev) => {
      const current = prev[page] || [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [page]: next };
    });
  };

  const toggleAllPage = (page) => {
    setFormPerms((prev) => {
      const allActions = schema[page] || [];
      const current = prev[page] || [];
      const allSelected = allActions.every((a) => current.includes(a));
      return { ...prev, [page]: allSelected ? [] : [...allActions] };
    });
  };

  /* ─── Save ─── */
  const handleSave = async () => {
    if (!formName.trim()) {
      return Swal.fire("Validation", "Role name is required", "warning");
    }

    // Strip empty pages
    const cleanPerms = {};
    Object.entries(formPerms).forEach(([page, actions]) => {
      if (actions.length > 0) cleanPerms[page] = actions;
    });

    try {
      const isNew = editingRole === "new";
      const url = isNew
        ? `${BASE_URL}/api/roles`
        : `${BASE_URL}/api/roles/${editingRole._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ name: formName, permissions: cleanPerms }),
      });
      const data = await res.json();
      if (!data.success) {
        return Swal.fire("Error", data.message, "error");
      }

      Swal.fire("Success", `Role ${isNew ? "created" : "updated"}`, "success");
      setEditingRole(null);
      fetchData();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Save failed", "error");
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (role) => {
    const confirm = await Swal.fire({
      title: `Delete "${role.name}"?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/api/roles/${role._id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!data.success) {
        return Swal.fire("Error", data.message, "error");
      }
      Swal.fire("Deleted", "Role removed", "success");
      fetchData();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Delete failed",
        "error",
      );
    }
  };

  /* ─── Labels ─── */
  const pageLabels = {
    dashboard: "Dashboard",
    employees: "Employees",
    projects: "Projects",
    attendance: "Attendance",
    reports: "Reports",
    logs: "Logs",
    employee_status: "Employee Status",
    profile: "Profile",
    my_projects: "My Projects",
    roles: "Roles",
  };

  const actionLabels = {
    view: "View",
    create: "Create",
    update: "Update",
    delete: "Delete",
    checkin: "Check In",
    checkout: "Check Out",
    change_password: "Change Password",
    update_status: "Update Status",
  };

  /* ─── Render ─── */
  if (loading) {
    return (
      <PageLayout title="Role Management">
        <div className="flex justify-center items-center h-64">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  // ── Edit / Create Form ──
  if (editingRole) {
    const isSystem = editingRole !== "new" && editingRole.isSystem;
    return (
      <PageLayout
        title={
          editingRole === "new"
            ? "Create Role"
            : `Edit Role – ${editingRole.name}`
        }
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setEditingRole(null)}
            className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors font-medium"
          >
            <ArrowLeft size={16} /> Back to roles
          </button>

          {/* Role Name */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Role Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              disabled={isSystem}
              className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all disabled:bg-gray-100"
              placeholder="e.g. Manager"
            />
            {isSystem && (
              <p className="text-xs text-amber-600 mt-1">
                System role – name cannot be changed
              </p>
            )}
          </div>

          {/* Permissions Grid */}
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Permissions
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Page / Resource
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">
                    All
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(schema).map(([page, actions], idx) => {
                  const selected = formPerms[page] || [];
                  const allChecked = actions.every((a) => selected.includes(a));
                  return (
                    <tr
                      key={page}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {pageLabels[page] || page}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={() => toggleAllPage(page)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-3">
                          {actions.map((action) => (
                            <label
                              key={action}
                              className="flex items-center gap-1.5 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={selected.includes(action)}
                                onChange={() => toggleAction(page, action)}
                                className="w-4 h-4 accent-blue-600"
                              />
                              <span className="text-gray-700">
                                {actionLabels[action] || action}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              {editingRole === "new" ? "Create Role" : "Save Changes"}
            </button>
            <button
              onClick={() => setEditingRole(null)}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── List View ──
  return (
    <PageLayout title="Role Management">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-xs">
            {roles.length} role{roles.length !== 1 && "s"} defined
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <Plus size={16} /> New Role
          </button>
        </div>

        <div className="grid gap-3 stagger-children">
          {roles.map((role) => {
            const permEntries =
              role.permissions instanceof Map
                ? Array.from(role.permissions.entries())
                : Object.entries(role.permissions || {});
            return (
              <div
                key={role._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Shield size={14} className="text-blue-500" />
                      {role.name}
                      {role.isSystem && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                          System
                        </span>
                      )}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {permEntries.map(([page, actions]) => (
                        <span
                          key={page}
                          className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md"
                        >
                          {pageLabels[page] || page}: {actions.join(", ")}
                        </span>
                      ))}
                      {permEntries.length === 0 && (
                        <span className="text-[11px] text-gray-400 italic">
                          No permissions assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(role)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleDelete(role)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
