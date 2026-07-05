import React, { useState } from "react";

const initialState = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactPosition: "",
};

const AddCustomerForm = ({ onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.companyName ||
      !form.companyEmail ||
      !form.contactName ||
      !form.contactEmail
    ) {
      setError("Company and contact name/email are required.");
      return;
    }
    setError("");
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-700">
          Add Company & Client Contact
        </h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name *
            </label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Email *
            </label>
            <input
              name="companyEmail"
              type="email"
              value={form.companyEmail}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Phone
            </label>
            <input
              name="companyPhone"
              value={form.companyPhone}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Address
            </label>
            <input
              name="companyAddress"
              value={form.companyAddress}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <hr />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Contact Name *
            </label>
            <input
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Contact Email *
            </label>
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Contact Phone
            </label>
            <input
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client Contact Position
            </label>
            <input
              name="contactPosition"
              value={form.contactPosition}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;
