import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { getWishlist } from "../api/services";
import { messaging } from "../config/firebase";
import { getToken, onMessage } from "firebase/messaging";

const AuthContext = createContext({});

const getExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch { return null; }
};
const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        console.log("[FCM] Notification permission:", permission);
        if (permission !== "granted") return;
        const token = await getToken(messaging, {
            vapidKey: "BJi2ll12gisDSA7wBVcc2kkve6nL9cKBQDe1L9kCsFrIMNTRuFcMjVmKWAHvAnM2D4IIsFXI3LX6nt_KH_rrAts"
        });
        console.log("[FCM] User token:", token?.slice(0, 30));
        if (token) await api.post("users/fcm-token", { token });
    } catch (err) {
        console.error("[FCM] token error:", err);
    }
};
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")) || null);
  const [wishCount, setWishCount] = useState(0);
  const timerRef = useRef(null);

  const listenerRef = useRef(false);

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
    requestNotificationPermission();
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
    console.log("[FCM-DEBUG] onMessage useEffect running, listenerRef:", listenerRef.current);
    if (listenerRef.current) {
      console.log("[FCM-DEBUG] Listener already registered, skipping");
      return;
    }
    listenerRef.current = true;
    console.log("[FCM-DEBUG] Registering onMessage listener NOW");
    const unsubscribe = onMessage(messaging, (payload) => {
        console.log("[FCM-DEBUG] onMessage fired! payload:", payload);
        const { title, body } = payload.data;
        new Notification(title, { body, icon: "/vite.svg" });
    });
    return () => {
        console.log("[FCM-DEBUG] Cleanup called");
        unsubscribe();
    };
  }, []);

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
