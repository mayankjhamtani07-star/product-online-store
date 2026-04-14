import { useEffect, useState } from "react";
import { FiPackage, FiUser, FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";
import axios from "axios";
import "./pages.css";

const LIMIT = 10;
const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColor = {
    Pending:    { bg: "#FFF8E1", color: "#F59E0B" },
    Processing: { bg: "#EEF0FD", color: "#7b7fe8" },
    Shipped:    { bg: "#E3F2FD", color: "#1976D2" },
    Delivered:  { bg: "#EDFAF3", color: "#27AE60" },
    Cancelled:  { bg: "#FFF0ED", color: "#E05A3A" },
};

const fmt = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const api = axios.create({ baseURL: "http://localhost:3001/api/" });
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    const fetchOrders = () => {
        setLoading(true);
        api.get("orders/admin/all", { params: { page, limit: LIMIT, ...(filterStatus && { status: filterStatus }) } })
            .then(res => { setOrders(res.data.data); setTotal(res.data.total); })
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, [page, filterStatus]); // eslint-disable-line

    const handleStatusUpdate = async (orderId, status) => {
        await api.put(`orders/admin/${orderId}/status`, { status });
        fetchOrders();
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Orders <span className="admin-page-count">{total} total</span></h2>
                <div className="admin-filters" style={{ margin: 0 }}>
                    {[["", "All"], ...STATUSES.map(s => [s, s])].map(([val, lbl]) => (
                        <button key={val} className={`admin-filter-btn ${filterStatus === val ? "admin-filter-btn--active" : ""}`}
                            onClick={() => { setFilterStatus(val); setPage(1); }}>{lbl}</button>
                    ))}
                </div>
            </div>

            {loading ? <div className="admin-loading">Loading...</div> : (
                <>
                    <div className="admin-cards">
                        {orders.length === 0 ? (
                            <div className="admin-loading">No orders found.</div>
                        ) : orders.map((order, i) => {
                            const s = statusColor[order.status] || statusColor.Pending;
                            const isOpen = expanded === order._id;
                            return (
                                <div key={order._id} className="admin-card" style={{ flexDirection: "column", alignItems: "stretch", gap: 0, padding: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 20px", cursor: "pointer" }}
                                        onClick={() => setExpanded(isOpen ? null : order._id)}>
                                        <span className="admin-card__num">{(page - 1) * LIMIT + i + 1}</span>
                                        <div className="admin-card__avatar">
                                            {order.userid?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="admin-card__info" style={{ flex: 1 }}>
                                            <strong>{order.userid?.name}</strong>
                                            <span>{order.userid?.email}</span>
                                        </div>
                                        <div className="admin-card__meta">
                                            <div className="admin-card__field">
                                                <label><FiPackage size={11} /> Items</label>
                                                <span>{order.items.length}</span>
                                            </div>
                                            <div className="admin-card__field">
                                                <label><FiClock size={11} /> Date</label>
                                                <span>{fmt(order.createdAt)}</span>
                                            </div>
                                            <div className="admin-card__field">
                                                <label>Total</label>
                                                <span style={{ color: "#f4785a", fontWeight: 700 }}>₹{order.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="admin-card__actions" onClick={e => e.stopPropagation()}>
                                            <select
                                                value={order.status}
                                                onChange={e => handleStatusUpdate(order._id, e.target.value)}
                                                style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 13, fontWeight: 600, color: s.color, background: s.bg, cursor: "pointer", outline: "none" }}>
                                                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </div>
                                        {isOpen ? <FiChevronUp size={16} color="#888" /> : <FiChevronDown size={16} color="#888" />}
                                    </div>

                                    {isOpen && (
                                        <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 20px", background: "#fafafa", display: "flex", flexDirection: "column", gap: 8 }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #f0f0f0" }}>
                                                    <img src={`http://localhost:3001/uploads/${item.image}`} alt={item.name}
                                                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{item.name}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f4785a" }}>₹{item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, fontSize: 13, color: "#888", paddingTop: 8, borderTop: "1px solid #eee" }}>
                                                <span>Subtotal: ₹{order.subtotal.toFixed(2)}</span>
                                                <span>Shipping: ₹{order.shipping.toFixed(2)}</span>
                                                <strong style={{ color: "#1a1a2e" }}>Total: ₹{order.total.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

export default ManageOrders;
