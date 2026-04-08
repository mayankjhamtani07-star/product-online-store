import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiUser, FiClock } from "react-icons/fi";
import { getAdminTicketsFire } from "../api/services";
import "./pages.css";

const fmt = (date) => {
    if (!date) return "—";
    const d = date?._seconds ? new Date(date._seconds * 1000) : new Date(date);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const ManageTicketsFire = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const filterStatus = searchParams.get("status") || "Open";

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    useEffect(() => {
        setLoading(true);
        getAdminTicketsFire(page, LIMIT, filterStatus)
            .then(res => {
                setTickets(res.data.data);
                setTotalPages(Math.ceil(res.data.total / LIMIT));
            })
            .catch(() => setTickets([]))
            .finally(() => setLoading(false));
    }, [page, filterStatus]);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Support Tickets (Firebase) <span style={{ fontSize: 12, fontWeight: 600, background: "#e8f8f0", color: "#27ae60", padding: "3px 10px", borderRadius: 50, marginLeft: 8, verticalAlign: "middle" }}>🔴 Live</span></h2>
                <div className="admin-filters" style={{ margin: 0 }}>
                    {[["Open", "Open"], ["In Progress", "In Progress"], ["Closed", "Closed"]].map(([val, lbl]) => (
                        <button key={val} className={`admin-filter-btn ${filterStatus === val ? "admin-filter-btn--active" : ""}`}
                            onClick={() => { setSearchParams({ status: val }); setPage(1); }}>{lbl}</button>
                    ))}
                </div>
            </div>

            {loading ? <div className="admin-loading">Loading...</div> : (
                <>
                    <div className="admin-cards">
                        {tickets.length === 0 ? (
                            <div className="admin-loading">No tickets found.</div>
                        ) : tickets.map(ticket => (
                            <div key={ticket.id} className="admin-card admin-card--clickable"
                                onClick={() => navigate(`/admin/ticket-fire/${ticket.id}`)}>
                                <div className="admin-card__left">
                                    <div className="admin-card__avatar admin-card__avatar--sq"
                                        style={{ background: "#eef0fd", color: "#7b7fe8", fontSize: 11, fontWeight: 700 }}>
                                        TKT
                                    </div>
                                    <div className="admin-card__info">
                                        <strong>{ticket.subject}</strong>
                                        <span>{ticket.description?.substring(0, 70)}{ticket.description?.length > 70 ? "..." : ""}</span>
                                    </div>
                                </div>
                                <div className="admin-card__meta">
                                    <div className="admin-card__field" style={{ width: 130 }}>
                                        <label><FiUser size={11} /> User</label>
                                        <span>{ticket.userName || "—"}</span>
                                    </div>
                                    <div className="admin-card__field" style={{ width: 110 }}>
                                        <label><FiClock size={11} /> Opened</label>
                                        <span>{fmt(ticket.createdAt)}</span>
                                    </div>
                                    {ticket.closedAt && (
                                        <div className="admin-card__field" style={{ width: 110 }}>
                                            <label>Closed</label>
                                            <span>{fmt(ticket.closedAt)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="admin-card__actions">
                                    <span className={`admin-badge admin-badge--${ticket.status.toLowerCase().replace(" ", "")}`}>
                                        {ticket.status}
                                    </span>
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

export default ManageTicketsFire;
