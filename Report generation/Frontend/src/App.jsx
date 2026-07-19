import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/students" element={<Students />} />

        <Route path="/student/:id" element={<StudentProfile />} />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/activity" element={<Activity />} />

        <Route path="/settings" element={<Settings />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
