import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { messaging } from "../../config/firebase";
import { getToken, onMessage } from "firebase/messaging";

const AdminContext = createContext();

const getExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp ? payload.exp * 1000 : null;
    } catch { return null; }
};

const requestAdminNotificationPermission = async (adminApi) => {
    try {
        const permission = await Notification.requestPermission();
        console.log("[FCM] Admin notification permission:", permission);
        if (permission !== "granted") return;
        const fcmToken = await getToken(messaging, {
            vapidKey: "BJi2ll12gisDSA7wBVcc2kkve6nL9cKBQDe1L9kCsFrIMNTRuFcMjVmKWAHvAnM2D4IIsFXI3LX6nt_KH_rrAts"
        });
        console.log("[FCM] Admin token:", fcmToken?.slice(0, 30));
        if (fcmToken) await adminApi.post("fcm-token", { token: fcmToken });
    } catch (err) {
        console.error("[FCM] Admin token error:", err);
    }
};

export const AdminProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem("admin_token") || "");
    const [admin, setAdmin] = useState(JSON.parse(sessionStorage.getItem("admin_user")) || null);
    const timerRef = useRef(null);

    const listenerRef = useRef(false);

    const logout = () => {
        sessionStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_user");
        setToken("");
        setAdmin(null);
        clearTimeout(timerRef.current);
    };

    const login = (newToken, userData) => {
        sessionStorage.setItem("admin_token", newToken);
        sessionStorage.setItem("admin_user", JSON.stringify(userData));
        setToken(newToken);
        setAdmin(userData);
        requestAdminNotificationPermission(api);
    };

    useEffect(() => {
        console.log("[FCM-DEBUG] admin onMessage useEffect running, listenerRef:", listenerRef.current);
        if (listenerRef.current) {
            console.log("[FCM-DEBUG] Admin listener already registered, skipping");
            return;
        }
        listenerRef.current = true;
        console.log("[FCM-DEBUG] Registering admin onMessage listener NOW");
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("[FCM-DEBUG] admin onMessage fired! payload:", payload);
            const { title, body } = payload.data;
            new Notification(title, { body, icon: "/vite.svg" });
        });
        return () => {
            console.log("[FCM-DEBUG] Admin cleanup called");
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
                    const expiry = getExpiry(sessionStorage.getItem("admin_token"));
                    if (!expiry || Date.now() >= expiry) logout();
                }
                return Promise.reject(err);
            }
        );
        return () => api.interceptors.response.eject(interceptor);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AdminContext.Provider value={{ token, admin, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
