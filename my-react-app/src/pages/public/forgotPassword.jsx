import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword as forgotPasswordApi } from "../../api/services";
import "../pages.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const res = await forgotPasswordApi(email);
            setMessage(res.data.message);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="login-form active">
                    <h2>Forgot Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className="login-btn" type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                        {message && <p style={{ color: "#27AE60", fontSize: "13px", margin: "4px 0 0", fontWeight: 600 }}>{message}</p>}
                        {error && <p style={{ color: "#e05a3a", fontSize: "13px", margin: "4px 0 0", fontWeight: 600 }}>{error}</p>}
                        <p><Link to="/login">Back to Login</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
