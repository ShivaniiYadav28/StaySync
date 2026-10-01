import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  // Allow browser to send HttpOnly refresh-token cookie
  withCredentials: true,
});

// =====================================
// REQUEST INTERCEPTOR
// =====================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

// =====================================
// RESPONSE INTERCEPTOR
// =====================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    // =====================================
    // DON'T REFRESH THESE REQUESTS
    // =====================================

    const isAuthRequest =
      originalRequest?.url?.includes(
        "/auth/login"
      ) ||
      originalRequest?.url?.includes(
        "/auth/register"
      ) ||
      originalRequest?.url?.includes(
        "/auth/refresh"
      ) ||
      originalRequest?.url?.includes(
        "/auth/logout"
      );

    // =====================================
    // HANDLE ACCESS TOKEN EXPIRY
    // =====================================

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const response =
          await api.post(
            "/auth/refresh"
          );

        const newAccessToken =
          response.data.accessToken;

        // Save new access token
        localStorage.setItem(
          "accessToken",
          newAccessToken
        );

        // Retry original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(
          originalRequest
        );
      } catch (refreshError) {
        // Refresh failed
        localStorage.removeItem(
          "accessToken"
        );

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;