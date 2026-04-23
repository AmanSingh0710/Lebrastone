import axios from "axios";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const baseURL = isLocalhost
  ? "http://localhost:5001"
  : "https://lebrostonebackend4.lifeinfotechinstitute.com";

/** Base URL for images/uploads - use same logic as baseURL */
export const IMAGE_BASE_URL = "https://lebrostonebackend4.lifeinfotechinstitute.com";

/**
 * Build full image URL from path (e.g. /uploads/... or uploads/...).
 * @param {string} path - Image path from API
 * @returns {string} Full URL
 */
export const getImageUrl = (path) => {
  if (!path) return "";
  if (typeof path !== "string") return "";
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  )
    return path;
  return `${IMAGE_BASE_URL}/${path.replace(/^\/+/, "")}`;
};

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

// Response interceptor for centralized error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        isNetworkError: true
      });
    }

    // Extract error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        "Something went wrong. Please try again.";

    // Handle 401 Unauthorized
    // Only redirect for session expiry, NOT for login failures
    const isAuthEndpoint = error.config?.url?.includes('/login') || 
                          error.config?.url?.includes('/signup') ||
                          error.config?.url?.includes('/google-auth') ||
                          error.config?.url?.includes('/manual-signup');
    
    if (error.response.status === 401) {
      // If it's a login/signup endpoint, just return the error (don't redirect)
      if (isAuthEndpoint) {
        return Promise.reject({
          message: errorMessage,
          status: 401
        });
      }
      
      // For other 401 errors (session expiry), redirect to login
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1000);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('userToken');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
      
      return Promise.reject({
        message: "Session expired. Please login again.",
        status: 401
      });
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      return Promise.reject({
        message: "Access denied. You don't have permission.",
        status: 403
      });
    }

    // Handle 500 Server Error
    if (error.response.status === 500) {
      return Promise.reject({
        message: "Server error. Please try again later.",
        status: 500
      });
    }

    // Return formatted error
    return Promise.reject({
      message: errorMessage,
      status: error.response.status,
      data: error.response.data
    });
  }
);

export default instance;
