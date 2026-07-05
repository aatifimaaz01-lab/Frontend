import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import PageLayout from "../components/PageLayout";
import AddCustomerForm from "../components/AddCustomerForm";

// Optionally, you can move this to a separate file for reuse
function CustomerCard({ customer }) {
  // Find primary contact (first contact or contact with position 'Primary')
  const primaryContact =
    Array.isArray(customer.contacts) && customer.contacts.length > 0
      ? customer.contacts.find(
          (c) => c.position?.toLowerCase() === "primary",
        ) || customer.contacts[0]
      : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 p-6 animate-fadeIn flex flex-col h-full min-h-85">
      {/* Top section: Company info and contact */}
      <div className="flex flex-col gap-3 mb-4 flex-1">
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-1 truncate">
            {customer.name}
          </h3>
          <div className="text-gray-600 text-sm mb-1 truncate">
            {customer.email}
          </div>
          <div className="text-gray-600 text-sm mb-1 truncate">
            {customer.phone}
          </div>
          <div className="text-gray-500 text-xs truncate">
            {customer.address}
          </div>
        </div>
        {/* Contact Person prominently displayed */}
        {primaryContact ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="font-medium text-blue-700 text-sm">
              Contact Person: {primaryContact.name}
            </div>
            {primaryContact.position && (
              <div className="text-xs text-gray-500">
                {primaryContact.position}
              </div>
            )}
            <div className="text-xs text-gray-600">
              Email:{" "}
              <span className="font-medium text-blue-700">
                {primaryContact.email}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Phone:{" "}
              <span className="font-medium text-blue-700">
                {primaryContact.phone}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-400">
            No contact person
          </div>
        )}
      </div>
      {/* Projects Section */}
      <div className="mt-auto">
        <div className="font-medium text-gray-700 mb-1">Projects:</div>
        {Array.isArray(customer.projects) && customer.projects.length > 0 ? (
          <ul className="list-disc pl-5 space-y-3 text-gray-600 text-sm">
            {customer.projects.map((project) => (
              <li key={project._id}>
                <div>
                  <span className="font-medium text-gray-800">
                    {project.title}
                  </span>
                  {project.status && (
                    <span className="ml-2 text-xs text-gray-500">
                      [{project.status}]
                    </span>
                  )}
                </div>
                {/* Members */}
                {Array.isArray(project.members) &&
                project.members.length > 0 ? (
                  <div className="ml-4 mt-1 flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <span
                        key={member._id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {member.name}
                        <span className="text-gray-400">({member.email})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="ml-4 text-xs text-gray-400">No members</div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400 text-sm">No projects</span>
        )}
      </div>
    </div>
  );
}

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Use BASE_URL for all API requests
        const { BASE_URL } = await import("../config");
        const res = await axios.get(`${BASE_URL}/api/customers`);

        console.log("API response:", res.data);

        const customersWithContactsAndProjects = await Promise.all(
          res.data.map(async (customer) => {
            try {
              const [contactsRes, projectsRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/customers/${customer._id}/contacts`),
                axios.get(`${BASE_URL}/api/customers/${customer._id}/projects`),
              ]);

              const contacts = Array.isArray(contactsRes.data)
                ? contactsRes.data
                : contactsRes.data?.contacts || [];
              const projects = Array.isArray(projectsRes.data)
                ? projectsRes.data
                : projectsRes.data?.projects || [];

              return {
                ...customer,
                contacts,
                projects,
              };
            } catch (err) {
              console.error("Contacts/projects fetch error:", err);
              return {
                ...customer,
                contacts: [],
                projects: [],
              };
            }
          }),
        );

        setCustomers(customersWithContactsAndProjects);
      } catch (err) {
        console.error("Customer fetch error:", err);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Loading overlay only over main content (not sidebar)
  if (loading)
    return (
      <PageLayout title="Customers">
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10">
          <div className="bg-white rounded-lg shadow px-8 py-6 text-lg text-blue-600 font-semibold animate-pulse-soft">
            Loading customers...
          </div>
        </div>
      </PageLayout>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-8 py-6 text-lg font-semibold">
          {error}
        </div>
      </div>
    );

  return (
    <PageLayout title="Customers" showBackButton>
      <div className="w-full py-8 px-2 md:px-0">
        {/* Header with search bar and Add Company button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative flex-1 md:w-96">
            {/* Search icon from lucide-react, consistent with other pages */}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search customer by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none transition-all"
            />
          </div>
          <button
            className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold flex items-center justify-center gap-2 text-sm"
            onClick={() => setShowAddModal(true)}
          >
            {/* Plus icon */}
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Company
          </button>
        </div>
        {/* Filter customers by search */}
        {customers.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 text-center">
            {/* FolderPlus icon for empty state, consistent with ProjectsList */}
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 mx-auto mb-3"
              viewBox="0 0 24 24"
            >
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z" />
            </svg>
            <p className="text-sm text-gray-400">No customers found</p>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {customers
              .filter((c) =>
                c.name?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((customer) => (
                <div className="w-full" key={customer._id}>
                  <CustomerCard customer={customer} />
                </div>
              ))}
          </div>
        )}
      </div>
      {showAddModal && (
        <AddCustomerForm
          loading={addLoading}
          onClose={() => {
            setShowAddModal(false);
            setAddError("");
          }}
          onSubmit={async (form) => {
            setAddLoading(true);
            setAddError("");
            try {
              const { BASE_URL } = await import("../config");
              // POST to /api/customers with company and contact details
              await axios.post(`${BASE_URL}/api/customers`, {
                name: form.companyName,
                email: form.companyEmail,
                phone: form.companyPhone,
                address: form.companyAddress,
                contact: {
                  name: form.contactName,
                  email: form.contactEmail,
                  phone: form.contactPhone,
                  position: form.contactPosition,
                },
              });
              setShowAddModal(false);
              setAddLoading(false);
              // Refresh customers list
              setLoading(true);
              setTimeout(() => window.location.reload(), 500); // quick reload for now
            } catch (err) {
              setAddError(
                err?.response?.data?.message || "Failed to add company",
              );
              setAddLoading(false);
            }
          }}
        />
      )}
    </PageLayout>
  );
};

export default Customers;
