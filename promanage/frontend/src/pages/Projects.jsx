import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useData } from "../context/DataContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import ProjectDrawer from "../components/ProjectDrawer";
import NewProjectModal from "../components/NewProjectModal";

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

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "on_hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "dropped", label: "Dropped" },
];

const PAGE_SIZE = 25;

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Projects() {
  const { projects, allEmployees, refreshAll } = useData();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [showNewProject, setShowNewProject] = useState(false);

  // Reset to page 1 whenever the filter changes, so the user isn't stuck
  // on e.g. page 6 of a filter that now only has 2 pages of results.
  useEffect(() => {
    setPage(1);
  }, [tab, debouncedQuery]);

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        if (tab === "all") return true;
        if (tab === "overdue") return p.is_overdue;
        return p.status === tab && !(tab === "active" && p.is_overdue);
      })
      .filter((p) => p.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [projects, tab, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  function handleUpdated(updated) {
    setSelected(updated);
    refreshAll();
  }

  function handleCreated(created) {
    setShowNewProject(false);
    setSelected(created);
    // refreshAll() re-syncs the shared dashboard/people/reports data in the
    // background; if it fails for any reason (e.g. a transient network
    // blip), that should never make it look like project *creation*
    // failed - the project was already saved successfully at this point.
    Promise.resolve(refreshAll()).catch((err) => {
      console.warn("Post-create refresh skipped:", err?.message);
    });
  }

  return (
    <main className="flex-1 px-8 py-7 max-w-[1600px]">
      <header className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Projects</h1>
          <p className="text-sm text-ink-soft mt-1">Browse, filter, and manage every project in the system.</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-accent-hover transition-colors shadow-card"
        >
          <Plus size={16} />
          New Project
        </button>
      </header>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-card flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-accent text-white" : "text-ink-soft hover:bg-surface-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/40 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-faint uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-2.5 font-medium">Project Name</th>
                <th className="px-5 py-2.5 font-medium">Phase</th>
                <th className="px-5 py-2.5 font-medium">Start</th>
                <th className="px-5 py-2.5 font-medium">Deadline</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium w-44">Progress</th>
                <th className="px-5 py-2.5 font-medium">Manager</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-ink-faint text-sm">
                    No projects match this filter.
                  </td>
                </tr>
              ) : (
                pageItems.map((p) => {
                  const displayStatus = p.is_overdue ? "overdue" : p.status;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="border-b border-gray-50 last:border-0 hover:bg-surface-muted/60 cursor-pointer"
                    >
                      <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                      <td className="px-5 py-3 text-ink-soft">{p.phase || "—"}</td>
                      <td className="px-5 py-3 text-ink-soft">{formatDate(p.start_date)}</td>
                      <td className="px-5 py-3 text-ink-soft">{formatDate(p.deadline)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[displayStatus]}`}>
                          {STATUS_LABELS[displayStatus]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, p.progress_percent)}%` }} />
                          </div>
                          <span className="text-xs text-ink-soft w-9 text-right">{Math.round(p.progress_percent)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{p.project_manager || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls - keeps the DOM small (max PAGE_SIZE rows)
            regardless of how many thousands of projects are loaded. */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 pt-4 mt-1 border-t border-gray-100">
            <p className="text-xs text-ink-faint">
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-surface-muted"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-ink-soft w-16 text-center">Page {pageSafe} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-surface-muted"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <ProjectDrawer
          project={selected}
          employees={allEmployees}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}

      {showNewProject && (
        <NewProjectModal
          employees={allEmployees}
          existingNames={projects.map((p) => p.name)}
          onClose={() => setShowNewProject(false)}
          onCreated={handleCreated}
        />
      )}
    </main>
  );
}
