import { useEffect, useState, useCallback } from "react";
import { checkBackendHealth, API_BASE_URL } from "../api/client";

/**
 * Polls the backend's /api/health endpoint and reports connection status.
 * Used on the Upload Data page so a failed upload is never a mystery -
 * the user sees *before* they upload whether the backend is even reachable.
 */
export function useBackendHealth(pollMs = 20000) {
  const [status, setStatus] = useState("checking"); // checking | ok | unreachable | wrong-service

  const check = useCallback(async () => {
    const result = await checkBackendHealth();
    if (result.ok) {
      setStatus("ok");
    } else if (result.reason === "unreachable") {
      setStatus("unreachable");
    } else {
      setStatus("wrong-service");
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, pollMs);
    return () => clearInterval(interval);
  }, [check, pollMs]);

  return { status, apiBaseUrl: API_BASE_URL, recheck: check };
}
