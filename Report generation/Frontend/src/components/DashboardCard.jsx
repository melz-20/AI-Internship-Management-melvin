import { memo } from "react";
import { useNavigate } from "react-router-dom";

function DashboardCard({ icon, title, value, subtitle, color = "bg-violet-600", to }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => to && navigate(to)} className="w-full min-w-0 rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-2 text-sm text-slate-500">{subtitle}</p></div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl text-white ${color}`}>{icon}</span>
      </div>
    </button>
  );
}

export default memo(DashboardCard);
