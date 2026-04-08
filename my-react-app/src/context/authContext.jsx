import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { getWishlist } from "../api/services";

const AuthContext = createContext({});

const getExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")) || null);
  const [wishCount, setWishCount] = useState(0);
  const timerRef = useRef(null);

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken("");
    setUser(null);
    setWishCount(0);
    clearTimeout(timerRef.current);
  };

  const login = (newToken, userData) => {
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const refreshWishCount = (type) => {
    if (type === "add") setWishCount(prev => prev + 1);
    if (type === "remove") setWishCount(prev => prev - 1);
  };

  useEffect(() => {
    if (!token) return;
    getWishlist()
      .then(res => setWishCount(res.data.length)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const expiry = getExpiry(token);
    if (!expiry) return;
    const delay = expiry - Date.now();
    if (delay <= 0) { logout(); return; }
    timerRef.current = setTimeout(logout, delay);
    return () => clearTimeout(timerRef.current);
  }, [token]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          const expiry = getExpiry(sessionStorage.getItem("token"));
          if (!expiry || Date.now() >= expiry) logout();
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []); 

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, wishCount, refreshWishCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
