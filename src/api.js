import axios from "axios";

const BASE_URL = "https://api.addaludo.com/api";

console.log("ADMIN API BASE URL:", BASE_URL);

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;