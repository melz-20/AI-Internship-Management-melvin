import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  getDashboardSummary,
  getProjects,
  getEmployees,
  getMonthlyProgress,
  getYearlyTrend,
  checkBackendHealth,
} from "../api/client";

const emptySummary = {
  total_projects: 0,
  active_projects: 0,
  completed_projects: 0,
  overdue_projects: 0,
  dropped_projects: 0,
  on_hold_projects: 0,
  unassigned_people: 0,
};

const DataContext = createContext(null);

/**
 * Single source of truth for everything derived from the uploaded dataset.
 * Wrapping the app in <DataProvider> means every page (Dashboard, Projects,
 * People, Reports, Upload Data) reads from the same in-memory state and can
 * call `refreshAll()` after an upload or an edit, instead of each page
 * owning its own duplicate fetch logic.
 */
export function DataProvider({ children }) {
  const [summary, setSummary] = useState(emptySummary);
  const [projects, setProjects] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  // Guards against React StrictMode's double-invoke in dev, and against
  // overlapping calls if refreshAll is triggered again before the first
  // one finishes - both of which would otherwise double up console noise.
  const inFlight = useRef(false);

  const refreshAll = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      // One cheap probe first. If the backend isn't reachable (or something
      // else is answering on this port), skip the six real data calls
      // entirely instead of letting each one fail individually - this is
      // what was flooding the browser console with repeated 404s.
      const health = await checkBackendHealth();
      setBackendConnected(health.ok);
      if (!health.ok) {
        setLoaded(true);
        return;
      }

      const [summaryRes, projectsRes, employeesRes, unassignedRes, monthlyRes, yearlyRes] = await Promise.all([
        getDashboardSummary(),
        getProjects(),
        getEmployees(false),
        getEmployees(true),
        getMonthlyProgress(),
        getYearlyTrend(),
      ]);
      setSummary(summaryRes);
      setProjects(projectsRes);
      setAllEmployees(employeesRes);
      setUnassignedEmployees(unassignedRes);
      setMonthlyData(monthlyRes);
      setYearlyData(yearlyRes);
    } catch (err) {
      setBackendConnected(false);
    } finally {
      setLoaded(true);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const value = {
    summary,
    projects,
    allEmployees,
    unassignedEmployees,
    monthlyData,
    yearlyData,
    loaded,
    backendConnected,
    refreshAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a <DataProvider>");
  return ctx;
}
