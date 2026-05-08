import axios from "axios";

const API = axios.create({
  baseURL: "https://api.addaludo.com/api",
});

// 🔐 Token auto attach
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;