import axios from "axios";

// Create an axios instance (optional, or use default axios)
const instance = axios.create();

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for 401 or invalid token
    if (
      error.response &&
      error.response.status === 401 &&
      (error.response.data?.message?.toLowerCase().includes("invalid token") ||
        error.response.data?.msg?.toLowerCase().includes("invalid token") ||
        error.response.data?.message?.toLowerCase().includes("token expired") ||
        error.response.data?.msg?.toLowerCase().includes("token expired"))
    ) {
      localStorage.clear();
      localStorage.setItem("invalidToken", "1");
      // Use window.location to force navigation outside React
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default instance;
