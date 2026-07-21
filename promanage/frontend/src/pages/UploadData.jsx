import React, { useState } from "react";
import { Trash2, Loader2, FileSpreadsheet, FileText, FileType, AlertCircle } from "lucide-react";
import FileUploader from "../components/FileUploader";
import BackendStatusBanner from "../components/BackendStatusBanner";
import { resetAllData } from "../api/client";
import { useData } from "../context/DataContext";

const COLUMN_GUIDE = [
  { name: "Project Name", note: "Required for project rows" },
  { name: "Start Date", note: "Any common date format" },
  { name: "Deadline", note: "Any common date format" },
  { name: "Actual Completion Date", note: "Only needed for completed projects" },
  { name: "Status", note: "active, completed, or dropped (defaults to active)" },
  { name: "Progress %", note: "Number 0–100" },
  { name: "Employee Name", note: "Leave blank to record an unassigned employee row" },
  { name: "Email", note: "Optional" },
  { name: "Role", note: "Employee's job title" },
  { name: "Assigned Date", note: "Defaults to Start Date if blank" },
  { name: "Role on Project", note: "e.g. Lead, Contributor, Reviewer" },
];

export default function UploadData() {
  const { summary, refreshAll } = useData();
  const [resetting, setResetting] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await resetAllData();
      await refreshAll();
      setConfirmingReset(false);
    } catch (err) {
      console.warn("Reset failed:", err?.message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="flex-1 px-8 py-7 max-w-[1000px]">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Upload Data</h1>
        <p className="text-sm text-ink-soft mt-1">
          Upload your project and employee dataset in Excel, CSV, Word, or PDF format. The dashboard,
          projects, people, and reports pages all update automatically once processing finishes.
        </p>
      </header>

      <BackendStatusBanner />

      <section className="mb-6">
        <FileUploader onProcessed={() => refreshAll()} />
      </section>

      {/* Supported formats */}
      <section className="card mb-6">
        <h3 className="font-semibold text-ink mb-3">Supported File Formats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <FileSpreadsheet size={16} className="text-accent" /> Excel (.xlsx, .xls)
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <FileText size={16} className="text-accent" /> CSV (.csv)
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <FileType size={16} className="text-accent" /> Word (.docx)
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <FileText size={16} className="text-accent" /> PDF (.pdf)
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <FileText size={16} className="text-accent" /> Text (.txt, .tsv)
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <FileType size={16} className="text-accent" /> JSON (.json)
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <FileText size={16} className="text-accent" /> Rich Text (.rtf)
          </div>
        </div>
        <p className="text-xs text-ink-faint mt-3">
          For Word and PDF files, data must be laid out as a table — the first row is treated as the header.
          Legacy binary Word (.doc) files aren't supported directly — save them as .docx first. Files with an
          unrecognized extension are still inspected and parsed automatically if their content matches a
          supported format.
        </p>
      </section>

      {/* Column reference */}
      <section className="card mb-6">
        <h3 className="font-semibold text-ink mb-3">Expected Columns</h3>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-faint uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-2.5 font-medium w-56">Column</th>
                <th className="px-5 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {COLUMN_GUIDE.map((c) => (
                <tr key={c.name} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-2.5 font-medium text-ink">{c.name}</td>
                  <td className="px-5 py-2.5 text-ink-soft">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Danger zone */}
      <section className="card border border-status-overdueBg">
        <h3 className="font-semibold text-ink mb-1 flex items-center gap-2">
          <AlertCircle size={16} className="text-status-overdue" />
          Clear All Data
        </h3>
        <p className="text-sm text-ink-soft mb-4">
          Removes every employee, project, and assignment currently stored ({summary.total_projects} projects,{" "}
          affects all pages) so you can start over with a fresh upload. This cannot be undone.
        </p>

        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="flex items-center gap-2 text-sm font-semibold text-status-overdue border border-status-overdueBg bg-status-overdueBg px-4 py-2 rounded-xl hover:opacity-80"
          >
            <Trash2 size={15} />
            Clear All Data
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-status-overdue px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {resetting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Yes, delete everything
            </button>
            <button
              onClick={() => setConfirmingReset(false)}
              disabled={resetting}
              className="text-sm font-semibold text-ink-soft px-4 py-2 rounded-xl hover:bg-surface-muted"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
