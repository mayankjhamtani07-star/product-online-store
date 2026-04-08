import bgheader from "../assets/images/bg-header.webp";
import "./components.css";
import { useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { FiTruck, FiRefreshCw, FiShield } from "react-icons/fi";

const SALE_END = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

const Countdown = memo(() => {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = SALE_END - Date.now();
      if (diff <= 0) return setTimeLeft({ h: "00", m: "00", s: "00" });
      setTimeLeft({
        h: String(Math.floor((diff / 1000 / 60 / 60) % 24)).padStart(2, "0"),
        m: String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0"),
        s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="app-header__countdown">
      <span className="app-header__countdown-label">Sale ends in</span>
      <div className="app-header__countdown-boxes">
        {[[timeLeft.h, "HRS"], [timeLeft.m, "MIN"], [timeLeft.s, "SEC"]].map(([val, unit]) => (
          <div className="app-header__countdown-box" key={unit}>
            <span className="app-header__countdown-num">{val}</span>
            <span className="app-header__countdown-unit">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const Header = memo(() => {
  const navigate = useNavigate();
  return (
    <header className="app-header" style={{ backgroundImage: `url(${bgheader})` }}>
      <div className="app-header__inner">
        <h2 className="app-header__left">
          <span className="app-header__kicker">FOR ONLINE ORDER</span>
          <span className="app-header__deal">
            <span className="app-header__dealNumber">30%</span>
            <span className="app-header__dealWord">OFF</span>
          </span>
          <Countdown />
          <button className="app-header__cta" onClick={() => navigate("/product")}>Shop Now →</button>
        </h2>
        <h2 className="app-header__right">
          <span>New Arrivals</span>
          <span>Just For</span>
          <span>You</span>
          <div className="app-header__badges">
            {[[FiTruck, "Free Shipping"], [FiRefreshCw, "Easy Returns"], [FiShield, "Secure Pay"]].map(([Icon, label]) => (
              <div className="app-header__badge" key={label}>
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </h2>
      </div>
    </header>
  );
});

export default Header;