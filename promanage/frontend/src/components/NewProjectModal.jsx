import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createProject } from "../api/client";

/**
 * Modal for manually creating a new project from the Projects page, as an
 * alternative to bulk dataset upload. Only the project name is required;
 * everything else (dates, phase, manager, initial team) is optional and
 * can be filled in immediately or left for later editing in the drawer.
 */
export default function NewProjectModal({ employees = [], existingNames = [], onClose, onCreated }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("active");
  const [phase, setPhase] = useState("");
  const [manager, setManager] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalizedExisting = new Set(existingNames.map((n) => n.trim().toLowerCase()));

  function toggleEmployee(id) {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }
    if (normalizedExisting.has(trimmedName.toLowerCase())) {
      setError(`A project named "${trimmedName}" already exists. Choose a different name, or open that project from the list to edit it instead.`);
      return;
    }
    if (startDate && deadline && deadline < startDate) {
      setError("Deadline cannot be before the start date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await createProject({
        name: trimmedName,
        start_date: startDate || null,
        deadline: deadline || null,
        status,
        phase: phase.trim() || null,
        project_manager: manager.trim() || null,
        employee_ids: selectedEmployeeIds,
      });
      onCreated(created);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else if (err?.request) {
        setError("Could not reach the backend to create this project. Check the connection status on the Upload Data page.");
      } else {
        setError(`Could not create the project (${err?.message || "unknown error"}).`);
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
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink">New Project</h2>
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
              Project Name <span className="text-status-overdue">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Portal Revamp"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1 block">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 bg-white"
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1 block">Phase</label>
              <input
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="e.g. Planning"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft mb-1 block">Project Manager</label>
            <input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. Priya Shah"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <p className="text-xs text-ink-faint mt-1">
              If this person isn't already in the system, they'll be added automatically.
            </p>
          </div>

          {employees.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-ink-soft mb-1 block">
                Assign Team Members (optional)
              </label>
              <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                {employees.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-surface-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="accent-accent"
                    />
                    <span className="text-ink">{emp.name}</span>
                    <span className="text-ink-faint text-xs">{emp.role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
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
            {saving ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
