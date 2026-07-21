import React, { useEffect, useState } from "react";
import { ChevronDown, Download, Loader2, AlertTriangle, PauseCircle, XCircle, FolderKanban } from "lucide-react";
import { getOverdueReport, getOnHoldReport, getDroppedReport, getProjects, downloadExcelExport } from "../api/client";

const REPORT_OPTIONS = [
  { key: "all", label: "All Projects" },
  { key: "overdue", label: "Overdue Projects" },
  { key: "on_hold", label: "On-Hold Projects" },
  { key: "dropped", label: "Dropped Projects" },
];

const STATUS_STYLES = {
  completed: "bg-status-completedBg text-status-completed",
  active: "bg-status-progressBg text-status-progress",
  overdue: "bg-status-overdueBg text-status-overdue",
  dropped: "bg-status-droppedBg text-status-dropped",
  on_hold: "bg-status-holdBg text-status-hold",
};
const STATUS_LABELS = {
  completed: "Completed", active: "In Progress", overdue: "Overdue", dropped: "Dropped", on_hold: "On Hold",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Reports() {
  const [reportType, setReportType] = useState("all");
  const [allData, setAllData] = useState([]);
  const [overdueData, setOverdueData] = useState([]);
  const [onHoldData, setOnHoldData] = useState([]);
  const [droppedData, setDroppedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getProjects(), getOverdueReport(), getOnHoldReport(), getDroppedReport()])
      .then(([all, overdue, onHold, dropped]) => {
        if (cancelled) return;
        setAllData(all);
        setOverdueData(overdue);
        setOnHoldData(onHold);
        setDroppedData(dropped);
      })
      .catch((err) => console.warn("Reports load skipped:", err?.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadExcelExport();
    } catch (err) {
      console.warn("Export failed:", err?.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="flex-1 px-8 py-7 max-w-[1600px]">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Reports</h1>
          <p className="text-sm text-ink-soft mt-1">Deeper analysis on project delivery, staffing, and risk.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-card"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export to Excel
        </button>
      </header>

      {/* Report-type dropdown */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative w-64">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm font-medium rounded-xl border border-gray-200 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
          >
            {REPORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
        </div>
        <p className="text-xs text-ink-faint">
          "Export to Excel" always exports every project, regardless of which report is selected here.
        </p>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-16 text-ink-faint text-sm">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading report…
        </div>
      ) : reportType === "all" ? (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban size={16} className="text-accent" />
            <h3 className="font-semibold text-ink">All Projects</h3>
            <span className="text-xs text-ink-faint ml-auto">{allData.length} projects</span>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-faint uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">Project</th>
                  <th className="px-5 py-2.5 font-medium">Phase</th>
                  <th className="px-5 py-2.5 font-medium">Manager</th>
                  <th className="px-5 py-2.5 font-medium">Deadline</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {allData.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-faint text-sm">No projects yet — upload a dataset or create one from the Projects page.</td></tr>
                ) : (
                  allData.map((p) => {
                    const displayStatus = p.is_overdue ? "overdue" : p.status;
                    return (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-surface-muted/60">
                        <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                        <td className="px-5 py-3 text-ink-soft">{p.phase || "—"}</td>
                        <td className="px-5 py-3 text-ink-soft">{p.project_manager || "—"}</td>
                        <td className="px-5 py-3 text-ink-soft">{formatDate(p.deadline)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[displayStatus]}`}>
                            {STATUS_LABELS[displayStatus]}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-soft">{Math.round(p.progress_percent)}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportType === "overdue" ? (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-status-overdue" />
            <h3 className="font-semibold text-ink">Overdue Projects</h3>
            <span className="text-xs text-ink-faint ml-auto">{overdueData.length} projects</span>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-faint uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">Project</th>
                  <th className="px-5 py-2.5 font-medium">Deadline</th>
                  <th className="px-5 py-2.5 font-medium">Days Overdue</th>
                  <th className="px-5 py-2.5 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {overdueData.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-ink-faint text-sm">No overdue projects — nice work.</td></tr>
                ) : (
                  overdueData.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                      <td className="px-5 py-3 text-ink-soft">{formatDate(p.deadline)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-status-overdueBg text-status-overdue">
                          {p.days_overdue}d overdue
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{Math.round(p.progress_percent)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportType === "on_hold" ? (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <PauseCircle size={16} className="text-status-hold" />
            <h3 className="font-semibold text-ink">On-Hold Projects</h3>
            <span className="text-xs text-ink-faint ml-auto">{onHoldData.length} projects</span>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-faint uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">Project</th>
                  <th className="px-5 py-2.5 font-medium">Phase</th>
                  <th className="px-5 py-2.5 font-medium">Deadline</th>
                  <th className="px-5 py-2.5 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {onHoldData.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-ink-faint text-sm">No projects are currently on hold.</td></tr>
                ) : (
                  onHoldData.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                      <td className="px-5 py-3 text-ink-soft">{p.phase || "—"}</td>
                      <td className="px-5 py-3 text-ink-soft">{formatDate(p.deadline)}</td>
                      <td className="px-5 py-3 text-ink-soft">{Math.round(p.progress_percent)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportType === "dropped" ? (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-status-dropped" />
            <h3 className="font-semibold text-ink">Dropped Projects</h3>
            <span className="text-xs text-ink-faint ml-auto">{droppedData.length} projects</span>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-faint uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">Project</th>
                  <th className="px-5 py-2.5 font-medium">Start Date</th>
                  <th className="px-5 py-2.5 font-medium">Drop Reason</th>
                </tr>
              </thead>
              <tbody>
                {droppedData.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-10 text-center text-ink-faint text-sm">No dropped projects — great news.</td></tr>
                ) : (
                  droppedData.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-surface-muted/60">
                      <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                      <td className="px-5 py-3 text-ink-soft">{formatDate(p.start_date)}</td>
                      <td className="px-5 py-3 text-ink-soft">{p.drop_reason || "No reason recorded"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </main>
  );
}
