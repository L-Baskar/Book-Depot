// src/utils/axiosInstance.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true,
});

// 🔑 Attach token + shopname automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (user?.shopname) {
    config.headers["x-shopname"] = user.shopname;
  }

  return config;
});

export default axiosInstance;
