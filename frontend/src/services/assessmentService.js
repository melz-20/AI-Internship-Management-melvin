import axios from "axios";
const api = axios.create({ baseURL: "http://127.0.0.1:8000" });
export const getAssessments = async () => (await api.get("/assessments")).data;
export const getAssessment = async (id) => (await api.get(`/assessments/${id}`)).data;
export const createAssessment = async (data) => (await api.post("/assessments", data)).data;
export const updateAssessment = async (id, data) => (await api.put(`/assessments/${id}`, data)).data;
export const deleteAssessment = async (id) => (await api.delete(`/assessments/${id}`)).data;
export const submitAssessment = async (id, data) => (await api.post(`/assessments/${id}/submit`, data)).data;
export const getDashboard = async () => (await api.get("/dashboard")).data;
