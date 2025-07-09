import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://web-production-61e73.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
    "Origin": "https://www.siz.land"
  },
});

export default axiosInstance;
