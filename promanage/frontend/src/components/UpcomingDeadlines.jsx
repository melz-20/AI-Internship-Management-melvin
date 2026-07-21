import React from "react";
import { CalendarClock } from "lucide-react";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function dateTagStyle(days) {
  if (days === null) return "bg-gray-100 text-ink-faint";
  if (days < 0) return "bg-status-overdueBg text-status-overdue";
  if (days <= 3) return "bg-status-droppedBg text-status-dropped";
  return "bg-status-progressBg text-status-progress";
}

function dateTagLabel(days) {
  if (days === null) return "No deadline";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `${days}d left`;
}

/**
 * "Upcoming Deadlines" list: shows the soonest project deadlines with a
 * color-coded date tag and stacked avatars for the assigned team.
 * Expects projects already sorted/filtered to the soonest N by the parent.
 */
export default function UpcomingDeadlines({ projects = [] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <CalendarClock size={16} className="text-accent" />
          Upcoming Deadlines
        </h3>
      </div>

      <div className="space-y-1">
        {projects.length === 0 ? (
          <p className="text-sm text-ink-faint py-6 text-center">No upcoming deadlines to show.</p>
        ) : (
          projects.map((p) => {
            const days = daysUntil(p.deadline);
            return (
              <div key={p.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-muted/70">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-ink-soft">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </p>
                </div>

                {/* Stacked avatars for the assigned team */}
                <div className="flex -space-x-2 shrink-0">
                  {(p.team || []).slice(0, 3).map((member) => (
                    <div
                      key={member.employee_id}
                      title={member.name}
                      className="w-7 h-7 rounded-full bg-accent/15 text-accent text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
                    >
                      {initials(member.name)}
                    </div>
                  ))}
                  {(p.team || []).length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-ink-soft text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                      +{p.team.length - 3}
                    </div>
                  )}
                </div>

                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${dateTagStyle(days)}`}>
                  {dateTagLabel(days)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
