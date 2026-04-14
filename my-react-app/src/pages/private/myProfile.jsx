import { useEffect, useState, useRef } from "react";
import { getMe, updateMe as updateMeApi, updatePassword as updatePasswordApi } from "../../api/services";
import { useAuth } from "../../context/authContext";
import { FiEdit3, FiLock, FiUser, FiPhone, FiMapPin } from "react-icons/fi";
import "../pages.css";

const MyProfile = () => {
    const { updateUser } = useAuth();
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState("edit");
    const [form, setForm] = useState({ name: "", address: "", phone: "" });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [message, setMessage] = useState({ text: "", type: "" });
    const fileRef = useRef();

    useEffect(() => {
        getMe().then(res => {
            setUser(res.data);
            const { name, address, phone, image } = res.data;
            setForm({ name: name || "", address: address || "", phone: phone || "" });
            if (image) setPreview(`http://localhost:3001/uploads/${image}`);
        }).catch(console.error);
    }, []);

    const switchTab = (t) => { setTab(t); setMessage({ text: "", type: "" }); };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("address", form.address);
            formData.append("phone", form.phone);
            if (image) formData.append("image", image);
            const res = await updateMeApi(formData);
            updateUser({ name: res.data.user.name, image: res.data.user.image });
            setUser(prev => ({ ...prev, ...res.data.user }));
            setMessage({ text: res.data.message, type: "success" });
        } catch (err) {
            setMessage({ text: err?.response?.data?.message || "Something went wrong", type: "error" });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword)
            return setMessage({ text: "Passwords do not match", type: "error" });
        try {
            const res = await updatePasswordApi({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            setMessage({ text: res.data.message, type: "success" });
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setMessage({ text: err?.response?.data?.message || "Something went wrong", type: "error" });
        }
    };

    if (!user) return null;

    const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

    return (
        <div className="pf-page">
            <div className="pf-layout">

                {/* Left — identity card */}
                <div className="pf-left">
                    <div className="pf-avatar-wrap" onClick={() => tab === "edit" && fileRef.current.click()}>
                        {preview
                            ? <img src={preview} alt={user.name} className="pf-avatar-img" />
                            : <span className="pf-avatar-initials">{initials}</span>
                        }
                        {tab === "edit" && <div className="pf-avatar-overlay">Change</div>}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files[0]; if (!f) return; setImage(f); setPreview(URL.createObjectURL(f)); }} />

                    <h2 className="pf-name">{user.name}</h2>
                    <p className="pf-email">{user.email}</p>
                    <span className="pf-role">{user.role}</span>

                    <div className="pf-info-list">
                        {user.phone && (
                            <div className="pf-info-row">
                                <FiPhone size={14} />
                                <span>{user.phone}</span>
                            </div>
                        )}
                        {user.address && (
                            <div className="pf-info-row">
                                <FiMapPin size={14} />
                                <span>{user.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — tabs + forms */}
                <div className="pf-right">
                    <div className="pf-tabs">
                        <button className={`pf-tab ${tab === "edit" ? "pf-tab--active" : ""}`} onClick={() => switchTab("edit")}>
                            <FiEdit3 size={14} /> Edit Profile
                        </button>
                        <button className={`pf-tab ${tab === "password" ? "pf-tab--active" : ""}`} onClick={() => switchTab("password")}>
                            <FiLock size={14} /> Change Password
                        </button>
                    </div>

                    {message.text && (
                        <p className={`pf-msg ${message.type === "success" ? "pf-msg--success" : "pf-msg--error"}`}>
                            {message.text}
                        </p>
                    )}

                    {tab === "edit" && (
                        <form className="pf-form" onSubmit={handleProfileSubmit}>
                            <div className="pf-field">
                                <label><FiUser size={13} /> Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                            </div>
                            <div className="pf-field">
                                <label><FiPhone size={13} /> Phone</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" />
                            </div>
                            <div className="pf-field">
                                <label><FiMapPin size={13} /> Address</label>
                                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
                            </div>
                            <button className="pf-submit" type="submit">Save Changes</button>
                        </form>
                    )}

                    {tab === "password" && (
                        <form className="pf-form" onSubmit={handlePasswordSubmit}>
                            <div className="pf-field">
                                <label>Current Password</label>
                                <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="Enter current password" />
                            </div>
                            <div className="pf-field">
                                <label>New Password</label>
                                <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Enter new password" />
                            </div>
                            <div className="pf-field">
                                <label>Confirm New Password</label>
                                <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Confirm new password" />
                            </div>
                            <button className="pf-submit" type="submit">Update Password</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
