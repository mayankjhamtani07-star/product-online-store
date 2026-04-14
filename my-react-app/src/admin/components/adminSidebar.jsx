import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { adminRoutesConfig } from "../routes/routesConfig";
import { useAdmin } from "../context/adminContext";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import "./components.css";

const sidebarRoutes = adminRoutesConfig.filter(r => r.icon);
 
const AdminSidebar = () => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, admin } = useAdmin();

    return (
        <aside className={`admin-sidebar ${expanded ? "admin-sidebar--open" : ""}`}>

            {/* Toggle at top */}
            <button className="admin-sidebar__toggle" onClick={() => setExpanded(p => !p)}>
                {expanded ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>

            {/* Nav links */}
            <ul className="admin-sidebar__links">
                {sidebarRoutes.map((r) => (
                    <li
                        key={r.fullPath}
                        title={r.label}
                        className={`admin-sidebar__item ${location.pathname === r.fullPath ? "admin-sidebar__item--active" : ""}`}
                        onClick={() => navigate(r.fullPath)}
                    >
                        <r.icon size={20} />
                        {expanded && <span>{r.label}</span>}
                    </li>
                ))}
            </ul>

            {/* Bottom: avatar + logout */}
            <div className="admin-sidebar__bottom">
                <div className="admin-sidebar__avatar" title={admin?.name}>
                    <span className="admin-sidebar__avatar-letter">{admin?.name?.[0]?.toUpperCase() || "A"}</span>
                    {expanded && <span className="admin-sidebar__avatar-name">{admin?.name}</span>}
                </div>
                <li className="admin-sidebar__item admin-sidebar__item--logout" onClick={logout} title="Logout">
                    <FiLogOut size={20} />
                    {expanded && <span>Logout</span>}
                </li>
            </div>
        </aside>
    );
};

export default AdminSidebar;
