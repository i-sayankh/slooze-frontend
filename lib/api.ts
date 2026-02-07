import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: process.env.BACKEND_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
