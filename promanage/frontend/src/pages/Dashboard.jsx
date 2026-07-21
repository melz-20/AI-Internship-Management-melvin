import React, { useMemo } from "react";
import { FolderKanban, PlayCircle, CheckCircle2, AlertTriangle, XCircle, PauseCircle, UserX } from "lucide-react";

import StatCard from "../components/StatCard";
import ProjectTable from "../components/ProjectTable";
import EmployeeList from "../components/EmployeeList";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import MonthlyProgressChart from "../components/charts/MonthlyProgressChart";
import YearlyTrendChart from "../components/charts/YearlyTrendChart";
import { useData } from "../context/DataContext";

export default function Dashboard() {
  const { summary, projects, allEmployees, unassignedEmployees, monthlyData, yearlyData, loaded } = useData();

  // Memoized so these O(n) passes over `projects` only re-run when the
  // project list actually changes, not on every render (e.g. typing in an
  // unrelated search box elsewhere) - matters once the dataset is large.
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

  const upcoming = useMemo(() => {
    return [...projects]
      .filter((p) => p.deadline && p.status === "active")
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);
  }, [projects]);

  const noData = loaded && summary.total_projects === 0;

  return (
    <main className="flex-1 px-8 py-7 max-w-[1600px]">
      <header className="mb-7">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Dashboard</h1>
        <p className="text-sm text-ink-soft mt-1">
          {noData
            ? "No data yet — use \"Upload Data\" in the sidebar to populate your dashboard."
            : "Here's what's happening across your projects today."}
        </p>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        <StatCard label="Total Projects" value={summary.total_projects} icon={FolderKanban} accent="brand" />
        <StatCard label="Active Projects" value={summary.active_projects} icon={PlayCircle} accent="progress" />
        <StatCard label="Completed" value={summary.completed_projects} icon={CheckCircle2} accent="completed" />
        <StatCard label="Overdue" value={summary.overdue_projects} icon={AlertTriangle} accent="overdue" />
        <StatCard label="On Hold" value={summary.on_hold_projects} icon={PauseCircle} accent="hold" />
        <StatCard label="Dropped" value={summary.dropped_projects} icon={XCircle} accent="dropped" />
        <StatCard label="Unassigned People" value={summary.unassigned_people} icon={UserX} accent="accent" />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-7">
        <MonthlyProgressChart data={monthlyData} />
        <YearlyTrendChart data={yearlyData} />
      </section>

      {/* Tables & lists */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <div className="xl:col-span-2">
          <ProjectTable projects={projects} />
        </div>
        <UpcomingDeadlines projects={upcoming} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-10">
        <EmployeeList variant="involved" employees={allEmployees} projectsByEmployee={projectsByEmployee} />
        <EmployeeList variant="unassigned" employees={unassignedEmployees} />
      </section>
    </main>
  );
}
