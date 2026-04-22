import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5033/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finx_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🚫 If no response → it's a network error, DO NOTHING
    if (!error.response) {
      console.log("Network error, skipping auth handling");
      return Promise.reject(error);
    }

    // if (error.response.status === 401) {
    //   localStorage.removeItem("finx_token");

    //   if (!window.location.pathname.includes("/login")) {
    //     window.location.href = "/login";
    //   }
    // }

    return Promise.reject(error);
  },
);
