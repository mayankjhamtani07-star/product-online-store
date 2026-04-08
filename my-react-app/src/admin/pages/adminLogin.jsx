import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/adminContext";
import { loginAdmin } from "../api/services";
import "./pages.css";

const AdminLogin = () => {
    const [data, setData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAdmin();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await loginAdmin(data);
            login(res.data.token, res.data.user);
            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="al-page">
            <div className="al-inner">
                <div className="al-character">
                    <img
                        src="https://assets.codepen.io/9051928/3d-character.png"
                        alt="character"
                        onError={e => e.target.style.display = "none"}
                    />
                </div>
                <div className="al-box">
                    <h2>Admin Login</h2>
                    <p>Secure your admin panel access</p>
                    <form onSubmit={handleSubmit}>
                        <label>Email address</label>
                        <div className="al-field">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                            <input
                                type="email"
                                placeholder="Ex. admin@company.com"
                                value={data.email}
                                onChange={e => setData({ ...data, email: e.target.value })}
                                required
                            />
                        </div>
                        <label>Password</label>
                        <div className="al-field">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={e => setData({ ...data, password: e.target.value })}
                                required
                            />
                        </div>
                        {error && <p className="al-error">{error}</p>}
                        <button type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
