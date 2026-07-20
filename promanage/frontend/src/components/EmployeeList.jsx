import React from "react";
import { UserRound, AlertTriangle } from "lucide-react";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-accent/15 text-accent",
  "bg-status-completedBg text-status-completed",
  "bg-status-progressBg text-status-progress",
  "bg-status-droppedBg text-status-dropped",
];

/**
 * Renders one of two panels depending on `variant`:
 *  - "involved":   People Involved in Projects (role + current project)
 *  - "unassigned": People Not Assigned to Any Project (bottleneck surfacing)
 */
export default function EmployeeList({ variant = "involved", employees = [], projectsByEmployee = {} }) {
  const isUnassigned = variant === "unassigned";

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          {isUnassigned && <AlertTriangle size={16} className="text-status-dropped" />}
          {isUnassigned ? "People Not Assigned to Any Project" : "People Involved in Projects"}
        </h3>
        <span className="text-xs text-ink-faint">{employees.length}</span>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {employees.length === 0 ? (
          <p className="text-sm text-ink-faint py-6 text-center">
            {isUnassigned ? "Everyone is currently assigned to a project." : "No people yet — upload a dataset first."}
          </p>
        ) : (
          employees.map((emp, idx) => {
            const currentProject = projectsByEmployee[emp.id]?.[0];
            return (
              <div
                key={emp.id}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-muted/70 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    AVATAR_COLORS[idx % AVATAR_COLORS.length]
                  }`}
                >
                  {initials(emp.name) || <UserRound size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{emp.name}</p>
                  <p className="text-xs text-ink-soft truncate">
                    {emp.role || "No role specified"}
                    {!isUnassigned && currentProject ? ` · ${currentProject}` : ""}
                  </p>
                </div>
                {isUnassigned && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-status-droppedBg text-status-dropped shrink-0">
                    Unassigned
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
