import { useEffect, useState, useRef } from "react";
import { getAllUsers, activateUser, deactivateUser } from "../api/services";
import Toggle from "../components/Toggle";
import "./pages.css";

const LIMIT = 10;

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(() => Number(sessionStorage.getItem("admin_user_page")) || 1);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const filterApplied = useRef(false);
    const usersRef = useRef([]);

    useEffect(() => {
        usersRef.current = users;
    }, [users]);

    const fetchUsers = (p = page, s = status, showLoading = true) => {
        if (showLoading) setLoading(true);
        getAllUsers(p, LIMIT, s)
            .then(res => { setUsers(res.data.data); setTotal(res.data.total); })
            .finally(() => { if (showLoading) setLoading(false); });
    };

    useEffect(() => {
        sessionStorage.setItem("admin_user_page", page);
        fetchUsers(page, status);
    }, [page, status]); // eslint-disable-line

    const toggle = async (user) => {
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
        try {
            user.status === "Active" ? await deactivateUser(user._id) : await activateUser(user._id);
            if (status) {
                filterApplied.current = false;
                setTimeout(() => {
                    if (filterApplied.current) return;
                    filterApplied.current = true;
                    const prev = usersRef.current;
                    const filtered = prev.filter(u => u.status === status);
                    const removed = prev.length - filtered.length;
                    
                    const newTotal = total - removed;
                    if (removed > 0) setTotal(t => t - removed);
                    
                    if (total > LIMIT && newTotal <= LIMIT && newTotal > 0) {
                        if (page !== 1) {
                            setPage(1);
                        } else {
                            fetchUsers(1, status, false);
                        }
                    } else if (filtered.length <= 5 && newTotal > filtered.length) {
                        if (page > 1 && newTotal <= (page - 1) * LIMIT) {
                            setPage(p => p - 1);
                        } else {
                            fetchUsers(page, status, false);
                        }
                    } else if (filtered.length === 0 && page > 1) {
                        setPage(p => p - 1);
                    }
                    
                    setUsers(filtered);
                }, 1200);
            }
        } catch {
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: user.status } : u));
        }
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="admin-page">
            <h2 className="admin-page-title">Users <span className="admin-page-count">{total} total</span></h2>
            <div className="admin-filters">
                {[["", "All"], ["Active", "Active"], ["Inactive", "Inactive"]].map(([val, label]) => (
                    <button key={val} className={`admin-filter-btn ${status === val ? "admin-filter-btn--active" : ""}`}
                        onClick={() => { setStatus(val); setPage(1); }}>{label}</button>
                ))}
            </div>
            {loading ? <div className="admin-loading">Loading...</div> : (
                <>
                    <div className="admin-cards">
                        {users.map((u, i) => (
                            <div key={u._id} className="admin-card">
                                <div className="admin-card__left">
                                    <span className="admin-card__num">{(page - 1) * LIMIT + i + 1}</span>
                                    <div className="admin-card__avatar">
                                        {u.image ? <img src={`http://localhost:3001/uploads/${u.image}`} alt={u.name} /> : <span>{u.name?.[0]?.toUpperCase()}</span>}
                                    </div>
                                    <div className="admin-card__info">
                                        <strong>{u.name}</strong>
                                        <span>{u.email}</span>
                                    </div>
                                </div>
                                <div className="admin-card__meta">
                                    <div className="admin-card__field" style={{width:120}}><label>Phone</label><span>{u.phone}</span></div>
                                    <div className="admin-card__field" style={{width:180}}><label>Address</label><span>{u.address}</span></div>
                                    <div className="admin-card__field" style={{width:110}}><label>Joined</label><span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span></div>
                                </div>
                                <div className="admin-card__actions">
                                    <Toggle active={u.status === "Active"} onToggle={() => toggle(u)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
                            ))}
                            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageUsers;
