import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

const AdminContext = createContext();

const getExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp ? payload.exp * 1000 : null;
    } catch { return null; }
};

export const AdminProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem("admin_token") || "");
    const [admin, setAdmin] = useState(JSON.parse(sessionStorage.getItem("admin_user")) || null);
    const timerRef = useRef(null);

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
    };

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
