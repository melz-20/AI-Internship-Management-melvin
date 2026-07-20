import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createEmployee } from "../api/client";

/**
 * Modal for manually adding a new person from the People page, as an
 * alternative to them only ever appearing via a dataset upload. Only the
 * name is required; email and role are optional. A client-side duplicate
 * check runs before hitting the server, and any error is shown in a large,
 * hard-to-miss banner - same pattern as NewProjectModal.
 */
export default function NewPersonModal({ existingNames = [], onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalizedExisting = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (normalizedExisting.has(trimmedName.toLowerCase())) {
      setError(`"${trimmedName}" is already in the system. Open them from the People page to edit their details instead.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await createEmployee({
        name: trimmedName,
        email: email.trim() || null,
        role: role.trim() || null,
      });
      onCreated(created);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else if (err?.request) {
        setError("Could not reach the backend to add this person. Check the connection status on the Upload Data page.");
      } else {
        setError(`Could not add this person (${err?.message || "unknown error"}).`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink">New Person</h2>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink p-1">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-status-overdueBg border border-status-overdue/30 text-status-overdue text-sm font-medium rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1 block">
              Name <span className="text-status-overdue">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jamie Chen"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jamie@example.com"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1 block">Role</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Engineer, QA, Project Manager"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <p className="text-xs text-ink-faint">
            They'll show up as "Unassigned" right away until you assign them to a project.
          </p>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-sm font-semibold text-ink-soft border border-gray-200 rounded-xl py-2.5 hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 bg-accent text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-accent-hover disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Adding…" : "Add Person"}
          </button>
        </div>
      </form>
    </div>
  );
}
