import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronDown } from "lucide-react";

// Colors pulled directly from the Tailwind status palette so the chart
// always matches the badges/cards elsewhere on the dashboard.
const COLORS = {
  active: "#38BDF8",
  completed: "#22C55E",
  overdue: "#EF4444",
  on_hold: "#A855F7",
  dropped: "#F97316",
};

/**
 * "Monthly Project Progress Overview" — a stacked bar chart showing, for
 * each month, how many projects fall into each status bucket. A dropdown
 * lets the user narrow the view to a single month (useful once many
 * months of data have accumulated) or view "All Months" at once.
 *
 * Data shape: [{ month: "2026-01", label: "Jan 2026", active: 4,
 *                completed: 2, overdue: 1, dropped: 0 }, ...]
 */
export default function MonthlyProgressChart({ data = [] }) {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const filtered = useMemo(() => {
    if (selectedMonth === "all") return data;
    return data.filter((d) => d.month === selectedMonth);
  }, [data, selectedMonth]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="font-semibold text-ink">Monthly Project Progress Overview</h3>

        {data.length > 0 && (
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
            >
              <option value="all">All Months</option>
              {data.map((d) => (
                <option key={d.month} value={d.month}>
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-ink-faint">
          No data yet — upload a dataset to see monthly progress.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={filtered} barGap={4} barCategoryGap={selectedMonth === "all" ? "20%" : "45%"}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #F3F4F6", boxShadow: "0 4px 12px rgba(16,24,40,0.08)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar dataKey="active" name="Active" stackId="a" fill={COLORS.active} />
            <Bar dataKey="completed" name="Completed" stackId="a" fill={COLORS.completed} />
            <Bar dataKey="overdue" name="Overdue" stackId="a" fill={COLORS.overdue} />
            <Bar dataKey="on_hold" name="On Hold" stackId="a" fill={COLORS.on_hold} />
            <Bar dataKey="dropped" name="Dropped" stackId="a" fill={COLORS.dropped} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
