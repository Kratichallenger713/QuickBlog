import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Backend Base URL
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// Create Context
const AppContext = createContext();

// Provider Component
export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  // ===========================
  // States
  // ===========================

  // User token — stored in localStorage as "userToken"
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Admin token — stored in localStorage as "adminToken"
  const [adminToken, setAdminToken] = useState(null);

  const [blogs, setBlogs] = useState([]);
  const [input, setInput] = useState("");

  // Use a ref to hold the latest token so the interceptor closure always
  // has access to current values without needing to re-register every render
  const tokenRef = useRef(null);
  tokenRef.current = token;

  // ===========================
  // Clear User Session Helper
  // ===========================
  const clearUserSession = () => {
    localStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
    tokenRef.current = null;
    delete axios.defaults.headers.common["Authorization"];
  };

  // ===========================
  // Global 401 Interceptor
  // Catches expired / invalid tokens on every request
  // ===========================
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      // Success — pass through unchanged
      (response) => response,

      // Error — check for 401
      (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || "";

        if (status === 401) {
          // --- Admin 401 ---
          // Admin routes use /api/admin — clear admin session and go to /admin
          if (requestUrl.includes("/api/admin")) {
            localStorage.removeItem("adminToken");
            setAdminToken(null);
            delete axios.defaults.headers.common["Authorization"];
            // Restore user token if one exists
            const savedUser = localStorage.getItem("userToken");
            if (savedUser) {
              axios.defaults.headers.common["Authorization"] = savedUser;
            }
            navigate("/admin");
            return Promise.reject(error);
          }

          // --- User silent 401 (profile check on page load) ---
          // /api/user/profile is called automatically on refresh.
          // If it returns 401, the token is expired — clear silently, no redirect.
          if (requestUrl.includes("/api/user/profile")) {
            clearUserSession();
            return Promise.reject(error);
          }

          // --- User active 401 (user performed an action) ---
          // Any other protected user route returned 401 — token expired mid-session.
          // Clear the session, show a message, and redirect to login.
          if (tokenRef.current) {
            // Only act if we thought we had a valid session
            clearUserSession();
            toast.error("Session expired. Please login again.");
            navigate("/login");
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []); // Register once on mount

  // ===========================
  // Fetch All Blogs (public)
  // ===========================
  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get("/api/blog/all");
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // 401 is handled by the interceptor above
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  // ===========================
  // Fetch Logged-in User Profile
  // ===========================
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/profile");
      if (data.success) {
        setUser(data.user);
      }
      // Non-success without throwing is handled silently
    } catch (error) {
      // 401 interceptor handles expired token — no additional action needed
    }
  };

  // ===========================
  // User Logout
  // ===========================
  const logout = () => {
    clearUserSession();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // ===========================
  // Admin Logout
  // ===========================
  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);

    // Restore user token if one exists so user session is not killed
    const savedUserToken = localStorage.getItem("userToken");
    if (savedUserToken) {
      axios.defaults.headers.common["Authorization"] = savedUserToken;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }

    navigate("/");
  };

  // ===========================
  // Load Blogs Once on Mount
  // ===========================
  useEffect(() => {
    fetchBlogs();
  }, []);

  // ===========================
  // Restore User Login After Refresh
  // ===========================
  useEffect(() => {
    const savedToken = localStorage.getItem("userToken");
    if (savedToken) {
      setToken(savedToken);
      tokenRef.current = savedToken;
      axios.defaults.headers.common["Authorization"] = savedToken;
      fetchUser(); // Validates the token — if expired, interceptor clears it silently
    }
  }, []);

  // ===========================
  // Restore Admin Login After Refresh
  // ===========================
  useEffect(() => {
    const savedAdminToken = localStorage.getItem("adminToken");
    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
    }
  }, []);

  // ===========================
  // Context Value
  // ===========================
  const value = {
    axios,
    navigate,

    // User auth
    token,
    setToken,
    user,
    setUser,
    fetchUser,
    logout,

    // Admin auth
    adminToken,
    setAdminToken,
    adminLogout,

    // Blogs
    blogs,
    setBlogs,
    fetchBlogs,

    // Search
    input,
    setInput,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useAppContext = () => {
  return useContext(AppContext);
};