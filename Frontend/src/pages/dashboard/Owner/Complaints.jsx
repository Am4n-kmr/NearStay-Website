import { useState } from "react";

const COMPLAINT_TYPES = [
  { value: "fake_listing", label: "Fake Listing" },
  { value: "misconduct", label: "Owner Misconduct" },
  { value: "hidden_charges", label: "Hidden Charges" },
  { value: "safety_concern", label: "Safety Concern" },
  { value: "fraud", label: "Fraud" },
  { value: "other", label: "Other" },
];

const statusConfig = {
  open: { label: "Open", color: "bg-amber-100 text-amber-700" },
  investigating: { label: "Investigating", color: "bg-blue-100 text-blue-700" },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700" },
  dismissed: { label: "Dismissed", color: "bg-gray-100 text-gray-600" },
};

const INITIAL_FORM = { type: "", title: "", description: "" };

export default function StudentComplaints() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [complaints, setComplaints] = useState([]);

  // Show a temporary toast notification
  const showToast = (title, description = "", variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3500);
  };

  // Manual validation replacing zod schema
  const validate = () => {
    const errs = {};
    if (!form.type) errs.type = "Please select a type";
    if (form.title.length < 5) errs.title = "Title must be at least 5 characters";
    if (form.description.length < 20) errs.description = "Description must be at least 20 characters";
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the error for the field being edited
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    // Simulate async API call
    await new Promise((res) => setTimeout(res, 800));

    const newComplaint = {
      id: crypto.randomUUID(),
      ...form,
      status: "open",
      resolution: null,
      createdAt: new Date().toISOString(),
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    showToast("Complaint filed", "We'll look into it within 48 hours.");
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitting(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              toast.variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-gray-900 text-white"
            }`}
          >
            <p>{toast.title}</p>
            {toast.description && (
              <p className="text-xs font-normal mt-0.5 opacity-80">{toast.description}</p>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Complaints</h1>
            <p className="text-sm text-gray-500 mt-0.5">Report issues with properties or owners</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            File Complaint
          </button>
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">File a Complaint</h2>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Complaint type</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                  >
                    <option value="">Select type</option>
                    {COMPLAINT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the issue in detail (min. 20 characters)"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                  {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Submitting..." : "Submit Complaint"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complaints list */}
        {complaints.length > 0 ? (
          <div className="space-y-3">
            {complaints.map((c) => {
              const sc = statusConfig[c.status] ?? { label: c.status, color: "bg-gray-100 text-gray-600" };
              return (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{c.type.replace(/_/g, " ")}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.description}</p>
                  {c.resolution && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-xs font-medium text-emerald-700">Resolution:</p>
                      <p className="text-xs text-emerald-600 mt-0.5">{c.resolution}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
            <svg className="h-10 w-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="font-medium text-gray-600">No complaints filed</p>
            <p className="text-sm mt-1">If you face any issues, you can file a complaint here</p>
          </div>
        )}
      </div>
    </div>
  );
}
