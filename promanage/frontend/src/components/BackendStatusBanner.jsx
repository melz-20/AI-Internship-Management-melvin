import React from "react";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useBackendHealth } from "../hooks/useBackendHealth";

const CONTENT = {
  checking: {
    icon: Loader2,
    spin: true,
    className: "bg-gray-50 border-gray-200 text-ink-soft",
    title: "Checking connection to backend…",
    detail: null,
  },
  ok: {
    icon: CheckCircle2,
    className: "bg-status-completedBg border-status-completed/30 text-status-completed",
    title: "Connected to the ProManage backend",
    detail: null,
  },
  unreachable: {
    icon: AlertTriangle,
    className: "bg-status-overdueBg border-status-overdue/30 text-status-overdue",
    title: "Can't reach the backend",
    detail:
      "This usually means the FastAPI server isn't running yet. In PowerShell: cd into promanage\\backend, activate the venv, then run \"uvicorn app.main:app --reload --port 8010\".",
  },
  "wrong-service": {
    icon: AlertTriangle,
    className: "bg-status-overdueBg border-status-overdue/30 text-status-overdue",
    title: "Something is responding, but it isn't the ProManage API",
    detail:
      "Another application is likely already using this port. Stop it, or run the ProManage backend on a different port and set VITE_API_BASE_URL in the frontend's .env file to match.",
  },
};

/**
 * Shows live backend connectivity status - but only when something is
 * actually wrong. While checking, or once confirmed connected, this
 * renders nothing at all, so a working setup never shows an intrusive
 * "all good" banner; the user only sees this when there's something to
 * act on (backend not running, or a different service on the port).
 */
export default function BackendStatusBanner() {
  const { status, apiBaseUrl, recheck } = useBackendHealth();

  if (status === "ok" || status === "checking") return null;

  const content = CONTENT[status];
  const Icon = content.icon;

  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 mb-6 ${content.className}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{content.title}</p>
        {content.detail && <p className="text-xs mt-1 opacity-90">{content.detail}</p>}
        <p className="text-xs mt-1 opacity-70">Expected backend URL: {apiBaseUrl}</p>
      </div>
      <button
        onClick={recheck}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white transition-colors shrink-0"
      >
        <RefreshCw size={12} />
        Retry
      </button>
    </div>
  );
}
