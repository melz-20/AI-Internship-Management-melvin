import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const STATUS_STYLES = {
  completed: "bg-status-completedBg text-status-completed",
  active: "bg-status-progressBg text-status-progress",
  overdue: "bg-status-overdueBg text-status-overdue",
  dropped: "bg-status-droppedBg text-status-dropped",
  on_hold: "bg-status-holdBg text-status-hold",
};

const STATUS_LABELS = {
  completed: "Completed",
  active: "In Progress",
  overdue: "Overdue",
  dropped: "Dropped",
  on_hold: "On Hold",
};

const FILTER_OPTIONS = [
  { key: "all", label: "All Statuses" },
  { key: "active", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
  { key: "on_hold", label: "On Hold" },
  { key: "dropped", label: "Dropped" },
];

// This widget is a compact Dashboard summary, not the full Projects table -
// capping rows rendered here keeps the Dashboard fast regardless of how
// many thousands of projects are in the dataset. The Projects page (with
// its own pagination) is where the complete list lives.
const MAX_ROWS = 8;

function resolveDisplayStatus(project) {
  // Overdue is computed by the backend (is_overdue), but visually it takes
  // priority over "active" so at-risk projects are never mistaken for on-track ones.
  if (project.is_overdue) return "overdue";
  return project.status; // active | completed | dropped | on_hold
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * "Projects by Deadline Status" table: name, deadline, status badge, and
 * an inline progress bar, with a status-filter dropdown so the user can
 * narrow the table down (e.g. just Overdue) without leaving the Dashboard.
 */
export default function ProjectTable({ projects = [] }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter((p) => resolveDisplayStatus(p) === statusFilter);
  }, [projects, statusFilter]);

  const visible = filtered.slice(0, MAX_ROWS);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="font-semibold text-ink">Projects by Deadline Status</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-faint">{Math.min(visible.length, filtered.length)} of {filtered.length}</span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-faint uppercase tracking-wide border-b border-gray-100">
              <th className="px-5 py-2.5 font-medium">Project Name</th>
              <th className="px-5 py-2.5 font-medium">Deadline</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium w-48">Progress</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-ink-faint text-sm">
                  {projects.length === 0
                    ? "No projects yet — upload a dataset to populate this table."
                    : "No projects match this filter."}
                </td>
              </tr>
            ) : (
              visible.map((p) => {
                const displayStatus = resolveDisplayStatus(p);
                return (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-surface-muted/60">
                    <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{formatDate(p.deadline)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[displayStatus]}`}
                      >
                        {STATUS_LABELS[displayStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, p.progress_percent))}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-soft w-9 text-right">{Math.round(p.progress_percent)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > MAX_ROWS && (
        <p className="text-xs text-ink-faint text-center mt-3">
          Showing {MAX_ROWS} of {filtered.length} — see the full list on the Projects page.
        </p>
      )}
    </div>
  );
}
