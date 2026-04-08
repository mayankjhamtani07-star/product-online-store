import { useEffect, useState } from "react";
import { getAllLeads } from "../api/services";
import { FiMail, FiCalendar } from "react-icons/fi";
import "./pages.css";

const LIMIT = 10;

const ManageLeads = () => {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(() => Number(sessionStorage.getItem("admin_lead_page")) || 1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sessionStorage.setItem("admin_lead_page", page);
        setLoading(true);
        getAllLeads(page, LIMIT)
            .then(res => { setLeads(res.data.data); setTotal(res.data.total); })
            .finally(() => setLoading(false));
    }, [page]);

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="admin-page">
            <h2 className="admin-page-title">Leads <span className="admin-page-count">{total} total</span></h2>

            {loading ? <div className="admin-loading">Loading...</div> : (
                <>
                    <div className="admin-cards">
                        {leads.map((l, i) => (
                            <div key={l._id} className="admin-card">
                                <div className="admin-card__left">
                                    <span className="admin-card__num">{(page - 1) * LIMIT + i + 1}</span>
                                    <div className="admin-card__avatar admin-card__avatar--lead">
                                        <FiMail size={18} />
                                    </div>
                                    <div className="admin-card__info">
                                        <strong>{l.email}</strong>
                                        <span>Newsletter subscriber</span>
                                    </div>
                                </div>
                                <div className="admin-card__meta">
                                    <div className="admin-card__field">
                                        <label>Subscribed On</label>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                            <FiCalendar size={12} />
                                            {l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {leads.length === 0 && <p className="admin-loading">No leads yet.</p>}
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

export default ManageLeads;
