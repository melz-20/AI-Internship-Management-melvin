import { useEffect, useMemo, useState } from "react";
import { MdAssessment, MdEmojiEvents, MdPeople, MdReport, MdTrendingDown, MdTrendingUp } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import SummaryCard from "../components/SummaryCard";
import PerformanceChart from "../components/PerformanceChart";
import { useSettings } from "../context/SettingsContext";

const API_URL = "http://127.0.0.1:5000";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null); const [error, setError] = useState("");
  const { settings } = useSettings();
  useEffect(() => { const controller = new AbortController(); fetch(`${API_URL}/dashboard`, { signal: controller.signal }).then(async (response) => { const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message); return result.data; }).then(setDashboard).catch((err) => { if (err.name !== "AbortError") setError(err.message || "Unable to load dashboard data."); }); return () => controller.abort(); }, []);
  useEffect(() => { const receiveRefresh = (event) => { if (event.detail) setDashboard(event.detail); }; window.addEventListener("internship:data-refresh", receiveRefresh); return () => window.removeEventListener("internship:data-refresh", receiveRefresh); }, []);
  useEffect(() => { const delays = { "Every 30 seconds": 30000, "Every 1 minute": 60000, "Every 5 minutes": 300000 }; const delay = delays[settings.dashboardAutoRefresh]; if (!delay) return undefined; const timer = setInterval(() => { fetch(`${API_URL}/dashboard`).then(async (response) => { const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message); return result.data; }).then((data) => { setDashboard(data); window.dispatchEvent(new CustomEvent("internship:data-refresh", { detail: data })); }).catch((err) => setError(err.message || "Unable to refresh dashboard data.")); }, delay); return () => clearInterval(timer); }, [settings.dashboardAutoRefresh]);
  const items = useMemo(() => dashboard ? [
    ["Total Students", dashboard.total_students, "View all student records", <MdPeople />, "bg-violet-600", "/students"],
    ["Performance Analytics", `${dashboard.average_score}%`, "Review performance trends", <MdAssessment />, "bg-indigo-600", "/analytics"],
    ["Reports", "Export", "Create performance reports", <MdReport />, "bg-slate-700", "/reports"],
    ["Outstanding Students", dashboard.outstanding, "Students exceeding 90%", <MdEmojiEvents />, "bg-emerald-600", "/students?category=Outstanding"],
    ["Needs Improvement", dashboard.needs_improvement, "Students below 60%", <MdTrendingDown />, "bg-rose-500", "/students?category=Needs%20Improvement"],
    ["Recent Activity", "View", "Latest student updates", <MdTrendingUp />, "bg-sky-600", "/activity"],
    ["Student Management", "Manage", "Add, edit, and review students", <MdPeople />, "bg-violet-500", "/students"],
  ] : [], [dashboard]);
  return <div className="flex min-h-screen bg-[#F8FAFC]"><Sidebar /><main className="min-w-0 flex-1 p-4 md:p-6"><Navbar /><section className="mt-7"><p className="text-sm font-medium text-violet-600">Overview</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Internship dashboard</h1><p className="mt-2 text-slate-500">A concise view of student progress and mentor priorities.</p></section>{!dashboard && !error && <div className="mt-7 rounded-xl bg-white p-5 text-slate-500 shadow-sm">Loading dashboard data...</div>}{error && <div className="mt-7 rounded-xl bg-white p-5 text-red-600 shadow-sm">{error}</div>}{dashboard && <><section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard icon={<MdPeople />} label="Total Students" value={dashboard.total_students} subtitle="Across all departments" /><SummaryCard icon={<MdTrendingUp />} label="Average Performance" value={`${dashboard.average_score}%`} subtitle="Overall performance score" accent="bg-indigo-100 text-indigo-600" /><SummaryCard icon={<MdEmojiEvents />} label="Outstanding" value={dashboard.outstanding} subtitle="Score of 90% or above" accent="bg-emerald-100 text-emerald-600" /><SummaryCard icon={<MdTrendingDown />} label="Needs Improvement" value={dashboard.needs_improvement} subtitle="Score below 60%" accent="bg-rose-100 text-rose-600" /></section><section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(([title, value, subtitle, icon, color, to]) => <DashboardCard key={title} title={title} value={value} subtitle={subtitle} icon={icon} color={color} to={to} />)}</section><section className="mt-7 max-w-4xl"><PerformanceChart distribution={dashboard} /></section></>}</main></div>;
}
export default Dashboard;
