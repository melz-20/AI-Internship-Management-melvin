import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, UserRound, AlertTriangle, Plus } from "lucide-react";
import { useData } from "../context/DataContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import NewPersonModal from "../components/NewPersonModal";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-accent/15 text-accent",
  "bg-status-completedBg text-status-completed",
  "bg-status-progressBg text-status-progress",
  "bg-status-droppedBg text-status-dropped",
];

const PAGE_SIZE = 30;

/**
 * People page: every employee in the system as cards, with dropdown
 * filters for role and assignment status (All / Assigned / Unassigned),
 * a debounced search box, and pagination so the grid stays fast even
 * with thousands of employees loaded.
 */
export default function People() {
  const { allEmployees, unassignedEmployees, projects, refreshAll } = useData();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [roleFilter, setRoleFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showNewPerson, setShowNewPerson] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, assignmentFilter, debouncedQuery]);

  const unassignedIds = useMemo(() => new Set(unassignedEmployees.map((e) => e.id)), [unassignedEmployees]);

  const projectsByEmployee = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      (p.team || []).forEach((member) => {
        map[member.employee_id] = map[member.employee_id] || [];
        map[member.employee_id].push(p.name);
      });
    });
    return map;
  }, [projects]);

  const roles = useMemo(() => {
    const set = new Set(allEmployees.map((e) => e.role).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [allEmployees]);

  const filtered = useMemo(() => {
    return allEmployees
      .filter((e) => (roleFilter === "all" ? true : e.role === roleFilter))
      .filter((e) => {
        if (assignmentFilter === "assigned") return !unassignedIds.has(e.id);
        if (assignmentFilter === "unassigned") return unassignedIds.has(e.id);
        return true;
      })
      .filter((e) => e.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [allEmployees, roleFilter, assignmentFilter, unassignedIds, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  return (
    <main className="flex-1 px-8 py-7 max-w-[1600px]">
      <header className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">People</h1>
          <p className="text-sm text-ink-soft mt-1">
            {allEmployees.length} people total · {unassignedEmployees.length} currently unassigned
          </p>
        </div>
        <button
          onClick={() => setShowNewPerson(true)}
          className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-accent-hover transition-colors shadow-card"
        >
          <Plus size={16} />
          New Person
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/40 w-60"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r === "all" ? "All Roles" : r}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
          >
            <option value="all">All (Assigned + Unassigned)</option>
            <option value="assigned">Assigned Only</option>
            <option value="unassigned">Unassigned Only</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageItems.length === 0 ? (
          <p className="col-span-full text-center text-sm text-ink-faint py-16">
            {allEmployees.length === 0 ? "No people yet — upload a dataset first." : "No one matches these filters."}
          </p>
        ) : (
          pageItems.map((emp, idx) => {
            const isUnassigned = unassignedIds.has(emp.id);
            const empProjects = projectsByEmployee[emp.id] || [];
            return (
              <div key={emp.id} className="card flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    AVATAR_COLORS[idx % AVATAR_COLORS.length]
                  }`}
                >
                  {initials(emp.name) || <UserRound size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{emp.name}</p>
                  <p className="text-xs text-ink-soft truncate">{emp.role || "No role specified"}</p>
                  {emp.email && <p className="text-xs text-ink-faint truncate mt-0.5">{emp.email}</p>}

                  {isUnassigned ? (
                    <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-status-droppedBg text-status-dropped">
                      <AlertTriangle size={11} /> Unassigned
                    </span>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {empProjects.slice(0, 2).map((name) => (
                        <span key={name} className="text-[11px] font-medium px-2 py-1 rounded-full bg-accent/10 text-accent truncate max-w-[9rem]">
                          {name}
                        </span>
                      ))}
                      {empProjects.length > 2 && (
                        <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-ink-faint">
                          +{empProjects.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-ink-faint">
            Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-surface-muted bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-ink-soft w-16 text-center">Page {pageSafe} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-surface-muted bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {showNewPerson && (
        <NewPersonModal
          existingNames={allEmployees.map((e) => e.name)}
          onClose={() => setShowNewPerson(false)}
          onCreated={() => {
            setShowNewPerson(false);
            Promise.resolve(refreshAll()).catch((err) => {
              console.warn("Post-create refresh skipped:", err?.message);
            });
          }}
        />
      )}
    </main>
  );
}
