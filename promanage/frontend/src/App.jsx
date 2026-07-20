import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import People from "./pages/People";
import Reports from "./pages/Reports";
import UploadData from "./pages/UploadData";
import { DataProvider } from "./context/DataContext";

/**
 * Root application shell: persistent Sidebar + main content area, wrapped
 * in <DataProvider> so every page shares one live copy of the uploaded
 * dataset. All five sidebar destinations are fully wired:
 *   Dashboard | Projects | People | Reports | Upload Data
 */
export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-surface">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        {activePage === "dashboard" && <Dashboard />}
        {activePage === "projects" && <Projects />}
        {activePage === "people" && <People />}
        {activePage === "reports" && <Reports />}
        {activePage === "upload" && <UploadData />}
      </div>
    </DataProvider>
  );
}
