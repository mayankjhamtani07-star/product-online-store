import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { loginUser as loginApi } from "../../api/services";
import { useAuth } from "../../context/authContext";
import useLampDrag from "../../hooks/useLampDrag";
import '../pages.css';

const Login = () => {
    const [data, setData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    useLampDrag(() => navigate("/signup"));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleLogin = async () => {
        try {
            const res = await loginApi(data);
            login(res.data.token, res.data.user);
            navigate("/");
        } catch (error) {
            setError(error?.response?.data?.message || "Server error");
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="lamp-wrapper">
                    <svg className="lamp-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f5d78e" />
                                <stop offset="50%" stopColor="#C9A96E" />
                                <stop offset="100%" stopColor="#a0784a" />
                            </linearGradient>
                        </defs>
                        <ellipse className="inner-glow" cx="100" cy="110" rx="60" ry="30" />
                        <rect className="lamp-base" x="92" y="100" width="16" height="160" rx="8" />
                        <rect className="lamp-base" x="60" y="250" width="80" height="12" rx="6" />
                        <g className="pull-cord">
                            <line className="cord-line" x1="130" y1="110" x2="130" y2="180" />
                            <circle className="cord-bead" cx="130" cy="190" r="6" />
                            <circle className="cord-hit" cx="130" cy="190" r="25" fill="transparent" />
                        </g>
                        <path className="lamp-shade" d="M30 110 C 30 50, 170 50, 170 110 C 170 125, 30 125, 30 110 Z" />
                    </svg>
                </div>
                <div className="login-form">
                    <h2>Welcome</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="Your Email" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} placeholder="••••••••" className="password-input" />
                                <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>
                        <button className="login-btn" type="submit">LogIn</button>
                        {error && <p style={{ color: "#e05a3a", fontSize: "13px", margin: "4px 0 0", fontWeight: 600 }}>{error}</p>}
                        <p><Link to="/forgot-password">Forgot Password?</Link></p>
                        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
