import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  UploadCloud,
  Boxes,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "people", label: "People", icon: Users },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "upload", label: "Upload Data", icon: UploadCloud },
];

/**
 * Left-hand navigation sidebar. `activePage` / `onNavigate` let the parent
 * (App.jsx) control which page is shown. All five items render a fully
 * wired page - Dashboard, Projects, People, Reports, and Upload Data.
 */
export default function Sidebar({ activePage = "dashboard", onNavigate = () => {} }) {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-brand-dark text-white flex flex-col">
      {/* Logo / brand mark */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-card">
          <Boxes size={20} strokeWidth={2.5} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">ProManage</span>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activePage === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? "bg-accent text-white shadow-card"
                  : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer / account area */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center text-sm font-semibold">
            PM
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Program Manager</p>
            <p className="text-xs text-white/50">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
