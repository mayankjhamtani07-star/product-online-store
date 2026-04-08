import { useEffect, useState } from "react";
import { getMe } from "../../api/services";
import "../pages.css";

const MyProfile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        getMe().then(res => setUser(res.data)).catch(console.error);
    }, []);

    if (!user) return null;

    const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-avatar">
                    {user.image
                        ? <img src={`http://localhost:3001/uploads/${user.image}`} alt={user.name} />
                        : <span>{initials}</span>
                    }
                </div>
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">{user.email}</p>
                <div className="profile-details">
                    <div className="profile-detail-item">
                        <span className="profile-detail-label">Phone</span>
                        <span className="profile-detail-value">{user.phone}</span>
                    </div>
                    <div className="profile-detail-item">
                        <span className="profile-detail-label">Address</span>
                        <span className="profile-detail-value">{user.address}</span>
                    </div>
                    <div className="profile-detail-item">
                        <span className="profile-detail-label">Role</span>
                        <span className="profile-detail-value">{user.role}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
