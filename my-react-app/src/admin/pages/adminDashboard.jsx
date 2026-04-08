import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats } from "../api/services";
import { useAdmin } from "../context/adminContext";
import { FiArrowRight } from "react-icons/fi";
import { adminRoutesConfig } from "../routes/routesConfig";
import "./pages.css";

const statCards = adminRoutesConfig.filter(r => r.statKey);
const quickLinks = adminRoutesConfig.filter(r => r.icon && r.path !== "dashboard");

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const { admin } = useAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        getDashboardStats()
            .then(res => setStats(res.data))
            .finally(() => setLoading(false));
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="admin-dashboard">
            <h2 className="admin-page-title">Dashboard</h2>

            <div className="admin-welcome">
                <div>
                    <h3>{greeting}, {admin?.name || "Admin"} 👋</h3>
                    <p>Here's what's happening in your store today.</p>
                </div>
                <span className="admin-welcome__icon">🛍️</span>
            </div>

            <div className="admin-stats">
                {statCards.map(({ statKey, statColor, label, icon: Icon }) => (
                    <div className="admin-stat-card" key={statKey} style={{ borderTopColor: statColor }}>
                        <div className="admin-stat-card__icon" style={{ background: `${statColor}18`, color: statColor }}>
                            <Icon size={22} />
                        </div>
                        <div className="admin-stat-card__info">
                            <span className="admin-stat-card__value">{loading ? "—" : stats[statKey] ?? 0}</span>
                            <span className="admin-stat-card__label">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="admin-page-title" style={{ fontSize: 16, marginBottom: 14 }}>Quick Actions</h3>
            <div className="admin-quick-links">
                {quickLinks.map((r) => (
                    <div key={r.fullPath} className="admin-quick-link" onClick={() => navigate(r.fullPath)}>
                        <r.icon size={18} />
                        {r.label}
                        <FiArrowRight size={14} style={{ marginLeft: "auto" }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
