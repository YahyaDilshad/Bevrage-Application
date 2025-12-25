import axios from "axios";

// 👈 apna real IP daalo
const host = "192.168.100.12";  // apna IP lagao (check ipconfig)

const axiosInstance = axios.create({
  baseURL: `http://${host}:5000/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use((req) => {
  console.log("[axios][req]", req.method?.toUpperCase(), req.baseURL + req.url);
  return req;
});

axiosInstance.interceptors.response.use(
  (res) => {
    console.log("[axios][res]", res.status, res.config.url);
    return res;
  },
  (error) => {
    console.error(
      "[axios][res][error]",
      error.message,
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export default axiosInstance;
