import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../api/services";
import useLampDrag from "../../hooks/useLampDrag";
import '../pages.css';

const SignUp = () => {
    const [data, setData] = useState({ name: "", email: "", password: "", address: "", phone: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useLampDrag(() => navigate("/login"));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleSignUp = async () => {
        try {
            await registerUser(data);
            navigate("/login");
        } catch (error) {
            setError(error?.response?.data?.message || "Server error");
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="lamp-wrapper">
                    <svg className="lamp-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
                        <ellipse className="inner-glow signup-glow" cx="100" cy="110" rx="60" ry="30" />
                        <rect className="lamp-base" x="92" y="100" width="16" height="160" rx="8" />
                        <rect className="lamp-base" x="60" y="250" width="80" height="12" rx="6" />
                        <g className="pull-cord">
                            <line className="cord-line" x1="130" y1="110" x2="130" y2="180" />
                            <circle className="cord-bead" cx="130" cy="190" r="6" />
                            <circle className="cord-hit" cx="130" cy="190" r="25" fill="transparent" />
                        </g>
                        <path className="lamp-shade signup-shade" d="M30 110 C 30 50, 170 50, 170 110 C 170 125, 30 125, 30 110 Z" />
                    </svg>
                </div>
                <div className="login-form compact">
                    <h2>Create Account</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" name="name" placeholder="Your Name" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="Your Email" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" onChange={handleChange} className="password-input" />
                                <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" name="address" placeholder="Your Address" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Phone No.</label>
                            <input type="tel" name="phone" placeholder="Your Phone Number" onChange={handleChange} />
                        </div>
                        <button className="login-btn" type="submit">Sign Up</button>
                        {error && <p style={{ color: "#e05a3a", fontSize: "13px", margin: "4px 0 0", fontWeight: 600 }}>{error}</p>}
                        <p>Already have an account? <Link to="/login">Login</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
