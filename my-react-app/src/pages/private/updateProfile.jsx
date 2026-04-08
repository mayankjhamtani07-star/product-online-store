import { useEffect, useState, useRef } from "react";
import { getMe, updateMe as updateMeApi } from "../../api/services";
import { useAuth } from "../../context/authContext";
import "../pages.css";

const UpdateProfile = () => {
    const { updateUser } = useAuth();
    const [form, setForm] = useState({ name: "", address: "", phone: "" });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState({ text: "", type: "" });
    const fileRef = useRef();

    useEffect(() => {
        getMe().then(res => {
            const { name, address, phone, image } = res.data;
            setForm({ name, address, phone });
            if (image) setPreview(`http://localhost:3001/uploads/${image}`);
        }).catch(console.error);
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("address", form.address);
            formData.append("phone", form.phone);
            if (image) formData.append("image", image);

            const res = await updateMeApi(formData);
            updateUser({ name: res.data.user.name, image: res.data.user.image });
            setMessage({ text: res.data.message, type: "success" });
        } catch (err) {
            setMessage({ text: err?.response?.data?.message || "Something went wrong", type: "error" });
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-card">
                <h2 className="profile-name">Update Profile</h2>
                <div className="profile-avatar" onClick={() => fileRef.current.click()} style={{ cursor: "pointer" }}>
                    {preview
                        ? <img src={preview} alt="preview" />
                        : <span>{form.name?.charAt(0).toUpperCase()}</span>
                    }
                    <div className="profile-avatar-edit">✎</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="profile-field">
                        <label>Name</label>
                        <input name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="profile-field">
                        <label>Address</label>
                        <input name="address" value={form.address} onChange={handleChange} />
                    </div>
                    <div className="profile-field">
                        <label>Phone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} />
                    </div>
                    {message.text && (
                        <p style={{ color: message.type === "success" ? "#27AE60" : "#E05A3A", fontSize: "13px", fontWeight: 600, margin: 0 }}>
                            {message.text}
                        </p>
                    )}
                    <button className="login-btn" type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
