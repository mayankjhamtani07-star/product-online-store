import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword as resetPasswordApi } from "../../api/services";
import "../pages.css";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return setError("Passwords do not match");
        setLoading(true);
        setError("");
        try {
            await resetPasswordApi(token, password);
            navigate("/login");
        } catch (err) {
            setError(err?.response?.data?.message || "Invalid or expired token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="login-form active">
                    <h2>Reset Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="password-input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <span onClick={() => setShowPassword(p => !p)} className="password-toggle">
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                        <button className="login-btn" type="submit" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                        {error && <p style={{ color: "#e05a3a", fontSize: "13px", margin: "4px 0 0", fontWeight: 600 }}>{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
