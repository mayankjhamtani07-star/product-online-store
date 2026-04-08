import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { UserAvatar } from './avatars';
import { LoginToast } from "../hooks/useAuthAction";
import { FiHeart } from "react-icons/fi";
import { routesConfig } from "../routes/routesConfig";
import "./components.css";

const Nav = ({ hideDropdown = false, onToggleSidebar, sidebarOpen }) => {
  const { token, user, wishCount } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const navLeft = routesConfig.filter(r => r.navSection === "left");
  const navRight = routesConfig.filter(r => r.navSection === "right");
  const navDropdown = routesConfig.filter(r => r.navSection === "dropdown");

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="app-nav">
      <div className="app-nav__left">
        {token && onToggleSidebar && (
          <button className="app-nav__toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <span className={`app-nav__toggle-icon ${sidebarOpen ? "open" : ""}`}>
              <span /><span /><span />
            </span>
          </button>
        )}
        <div className="app-nav__brand">
          <h2>Online Store</h2>
        </div>
      </div>

      {token ? (
        <>
          <div className="app-nav__right">
            <button className="app-nav__wishBtn" onClick={() => navigate("/wishlist")}>
              <FiHeart size={20} />
              {wishCount > 0 && <span className="app-nav__wishCount">{wishCount}</span>}
            </button>
            <div className="app-nav__userWrapper" ref={dropdownRef}>
              <button type="button" className="app-nav__userAvatar" onClick={() => setOpen(p => !p)}>
                {initials}
              </button>
              {!hideDropdown && open && (
                <div className="app-nav__dropdown">
                  <div className="app-nav__dropdownProfile">
                    {user?.image
                      ? <img src={`http://localhost:3001/uploads/${user.image}`} alt={user.name} className="app-nav__dropdownAvatar" />
                      : <UserAvatar size={40} />
                    }
                    <span className="app-nav__dropdownName">{user?.name}</span>
                  </div>
                  {navDropdown.map(r => (
                    <button key={r.path} className="app-nav__dropdownItem" onClick={() => { navigate(r.path); setOpen(false); }}>{r.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <nav className="app-nav__links">
            {navLeft.map(r => (
              <li key={r.path}
                className={location.pathname === r.path ? "app-nav__link--active" : ""}
                onClick={() => navigate(r.path)}>
                {r.label}
              </li>
            ))}
          </nav>
          <div className="app-nav__right">
            
            {navRight.map(r => (
              <button key={r.path}
                className={r.navStyle === "button" ? "app-nav__btn--primary" : "app-nav__btn--link"}
                onClick={() => navigate(r.path)}>
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}

      <LoginToast show={false} />
    </header>
  );
};

export default Nav;
