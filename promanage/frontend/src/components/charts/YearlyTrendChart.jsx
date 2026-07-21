import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = {
  total: "#6366F1",
  completed: "#22C55E",
  dropped: "#F97316",
  active: "#38BDF8",
  on_hold: "#A855F7",
};

/**
 * "Project Summary (Year) Trend" — a grouped bar chart summarizing, per
 * calendar year, the total number of projects started that year alongside
 * how many ended up completed, dropped, or are still active. Replaces the
 * old cumulative monthly line chart with a clearer year-over-year bar view
 * of overall delivery volume.
 *
 * Data shape: [{ year: "2025", total: 14, completed: 9, dropped: 2, active: 3 }, ...]
 */
export default function YearlyTrendChart({ data = [] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink">Project Summary (Year) Trend</h3>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-ink-faint">
          No data yet — upload a dataset to see the yearly trend.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #F3F4F6", boxShadow: "0 4px 12px rgba(16,24,40,0.08)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Bar dataKey="total" name="Total Projects" fill={COLORS.total} radius={[6, 6, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill={COLORS.completed} radius={[6, 6, 0, 0]} />
            <Bar dataKey="on_hold" name="On Hold" fill={COLORS.on_hold} radius={[6, 6, 0, 0]} />
            <Bar dataKey="dropped" name="Dropped" fill={COLORS.dropped} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
