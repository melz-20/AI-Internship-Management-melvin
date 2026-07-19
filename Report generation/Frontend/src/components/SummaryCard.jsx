import { memo } from "react";

function SummaryCard({ icon, label, value, subtitle, accent = "bg-violet-100 text-violet-600" }) {
  return <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${accent}`}>{icon}</span></div></div>;
}
export default memo(SummaryCard);
