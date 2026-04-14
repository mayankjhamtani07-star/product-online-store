import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { routesConfig } from "../routes/routesConfig";
import { useAuth } from "../context/authContext";
import { UserAvatar } from "./avatars";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, wishCount } = useAuth();
    const [open, setOpen] = useState(false);

    const sidebarTop = routesConfig.filter(r => r.sidebarSection === "top");
    const sidebarBottom = routesConfig.filter(r => r.sidebarSection === "bottom");

    const go = (path) => { navigate(path); };

    return (
        <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>

            {/* Brand / Toggle */}
            <div className="sidebar__brand">
                <button className="sidebar__brand-icon" onClick={() => setOpen(p => !p)} title={open ? "Collapse" : "Expand"}>
                    S
                </button>
                <span className="sidebar__brand-name" onClick={() => go("/")}>Online Store</span>
            </div>

            <ul className="sidebar__links">
                {sidebarTop.map(({ icon: Icon, label, path }) => (
                    <li key={path} title={label}
                        className={`sidebar__item ${location.pathname === path || location.pathname.startsWith(path + "/") ? "sidebar__item--active" : ""}`}
                        onClick={() => go(path)}>
                        {Icon && <Icon size={18} />}
                        <span>{label}</span>
                        {path === "/wishlist" && wishCount > 0 && (
                            <span className="sidebar__wish-count">{wishCount}</span>
                        )}
                    </li>
                ))}
            </ul>

            <div className="sidebar__bottom">
                {sidebarBottom.map(({ icon: Icon, label, path }) => (
                    <li key={path} className="sidebar__item sidebar__item--logout" title={label} onClick={() => go(path)}>
                        {Icon && <Icon size={18} />}
                        <span>{label}</span>
                    </li>
                ))}
                <div className="sidebar__user" title={user?.name} onClick={() => go("/profile")}>
                    {user?.image
                        ? <img src={`http://localhost:3001/uploads/${user.image}`} alt={user.name} className="sidebar__user-avatar" />
                        : <UserAvatar size={32} />
                    }
                    <span className="sidebar__user-name">{user?.name}</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
