import axios from 'axios'
/** Ready for FastAPI: update VITE_API_BASE_URL and replace mock service calls incrementally. */
export const axiosClient=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL ?? '/api/v1',headers:{'Content-Type':'application/json'}})
