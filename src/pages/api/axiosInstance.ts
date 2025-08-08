import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.EXTERNAL_API_URL || "https://web-production-61e73.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
