import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * A single dashboard summary card (Total / Active / Completed / Overdue /
 * Dropped / Unassigned). `accent` selects the icon background + text color
 * from the Tailwind status palette defined in tailwind.config.js.
 *
 * `change` is optional: pass a signed number (e.g. 12 or -4) to show a
 * small percentage-change indicator, matching the reference dashboard.
 */
export default function StatCard({ label, value, icon: Icon, accent = "accent", change }) {
  const accentClasses = {
    accent: "bg-accent/10 text-accent",
    completed: "bg-status-completedBg text-status-completed",
    progress: "bg-status-progressBg text-status-progress",
    overdue: "bg-status-overdueBg text-status-overdue",
    dropped: "bg-status-droppedBg text-status-dropped",
    hold: "bg-status-holdBg text-status-hold",
    brand: "bg-brand/10 text-brand",
  };

  const isPositive = typeof change === "number" && change >= 0;

  return (
    <div className="card flex flex-col gap-4 hover:shadow-cardHover transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentClasses[accent]}`}>
          <Icon size={19} strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-ink tracking-tight">{value}</span>
        {typeof change === "number" && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isPositive ? "text-status-completed" : "text-status-overdue"
            }`}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
