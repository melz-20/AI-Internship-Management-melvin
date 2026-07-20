import axios from "axios";

// Backend base URL. Defaults to the standard local dev address; override by
// creating a `.env` file in the frontend folder with:
//   VITE_API_BASE_URL=http://127.0.0.1:8010
// (useful if your backend runs on a different port, e.g. 8010 is already
// taken by another app on your machine).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8010";

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

/**
 * Pings the backend's /api/health endpoint and confirms it's actually the
 * ProManage API (not some other service that happens to be running on the
 * same port). Returns { ok: true } or { ok: false, reason } so the UI can
 * show an actionable message instead of a generic error.
 */
export async function checkBackendHealth() {
  try {
    const { data } = await client.get("/api/health", { timeout: 4000 });
    if (data?.service === "ProManage API") {
      return { ok: true };
    }
    return { ok: false, reason: "unexpected-service" };
  } catch (err) {
    if (err.response) {
      // Got a response, just not a healthy/matching one (e.g. 404 from a
      // different app running on this port).
      return { ok: false, reason: "wrong-service", status: err.response.status };
    }
    return { ok: false, reason: "unreachable" };
  }
}

export async function getSupportedFormats() {
  const { data } = await client.get("/api/upload/formats");
  return data.extensions;
}

export async function uploadDataset(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return data;
}

export async function getDashboardSummary() {
  const { data } = await client.get("/api/dashboard/summary");
  return data;
}

export async function getProjects(status) {
  const { data } = await client.get("/api/projects", {
    params: status ? { status } : {},
  });
  return data;
}

export async function getEmployees(unassignedOnly = false) {
  const { data } = await client.get("/api/employees", {
    params: unassignedOnly ? { unassigned_only: true } : {},
  });
  return data;
}

export async function getMonthlyProgress() {
  const { data } = await client.get("/api/charts/monthly-progress");
  return data;
}

export async function getYearlyTrend() {
  const { data } = await client.get("/api/charts/yearly-trend");
  return data;
}

export async function updateProject(id, payload) {
  const { data } = await client.patch(`/api/projects/${id}`, payload);
  return data;
}

export async function createProject(payload) {
  const { data } = await client.post("/api/projects", payload);
  return data;
}

export async function createEmployee(payload) {
  const { data } = await client.post("/api/employees", payload);
  return data;
}

export async function addProjectMembers(projectId, employeeIds, roleOnProject) {
  const { data } = await client.post(`/api/projects/${projectId}/assignments`, {
    employee_ids: employeeIds,
    role_on_project: roleOnProject || null,
  });
  return data;
}

export async function removeProjectMember(projectId, employeeId) {
  const { data } = await client.delete(`/api/projects/${projectId}/assignments/${employeeId}`);
  return data;
}

export async function getEmployeeAssignments(employeeId) {
  const { data } = await client.get(`/api/employees/${employeeId}/assignments`);
  return data;
}

export async function getCompletedEarlyReport() {
  const { data } = await client.get("/api/projects/completed-early");
  return data;
}

export async function getDroppedReport() {
  const { data } = await client.get("/api/projects/dropped");
  return data;
}

export async function getOnHoldReport() {
  const { data } = await client.get("/api/projects/on-hold");
  return data;
}

export async function getOverdueReport() {
  const { data } = await client.get("/api/projects/overdue-report");
  return data;
}

export async function downloadExcelExport() {
  const response = await client.get("/api/reports/export", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "promanage_projects_export.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function resetAllData() {
  const { data } = await client.delete("/api/admin/reset");
  return data;
}

export default client;
