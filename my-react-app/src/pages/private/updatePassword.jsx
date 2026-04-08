import { useState } from "react";
import { updatePassword as updatePasswordApi } from "../../api/services";
import "../pages.css";

const UpdatePassword = () => {
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword)
            return setMessage({ text: "New passwords do not match", type: "error" });
        try {
            const res = await updatePasswordApi({ currentPassword: form.currentPassword, newPassword: form.newPassword });
            setMessage({ text: res.data.message, type: "success" });
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setMessage({ text: err?.response?.data?.message || "Something went wrong", type: "error" });
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-card">
                <h2 className="profile-name">Update Password</h2>
                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="profile-field">
                        <label>Current Password</label>
                        <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} />
                    </div>
                    <div className="profile-field">
                        <label>New Password</label>
                        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />
                    </div>
                    <div className="profile-field">
                        <label>Confirm New Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
                    </div>
                    {message.text && (
                        <p style={{ color: message.type === "success" ? "#27AE60" : "#E05A3A", fontSize: "13px", fontWeight: 600, margin: 0 }}>
                            {message.text}
                        </p>
                    )}
                    <button className="login-btn" type="submit">Update Password</button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
