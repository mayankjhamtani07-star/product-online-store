import { useEffect, useState, useRef } from "react";
import { getAllExperiences, activateExperience, deactivateExperience, getExperienceDetail } from "../api/services";
import Toggle from "../components/Toggle";
import "./pages.css";

const LIMIT = 10;

const ManageExperiences = () => {
    const [experiences, setExperiences] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(() => Number(sessionStorage.getItem("admin_exp_page")) || 1);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);
    const filterApplied = useRef(false);
    const experiencesRef = useRef([]);

    useEffect(() => {
        experiencesRef.current = experiences;
    }, [experiences]);

    const fetchList = (p = page, s = status, showLoading = true) => {
        if (showLoading) setLoading(true);
        getAllExperiences(p, LIMIT, s)
            .then(res => { setExperiences(res.data.data); setTotal(res.data.total); })
            .finally(() => { if (showLoading) setLoading(false); });
    };

    useEffect(() => {
        sessionStorage.setItem("admin_exp_page", page);
        fetchList(page, status);
    }, [page, status]); // eslint-disable-line

    const toggle = async (exp) => {
        setExperiences(prev => prev.map(e => e._id === exp._id ? { ...e, status: e.status === "Active" ? "Inactive" : "Active" } : e));
        try {
            exp.status === "Active" ? await deactivateExperience(exp._id) : await activateExperience(exp._id);
            if (status) {
                filterApplied.current = false;
                setTimeout(() => {
                    if (filterApplied.current) return;
                    filterApplied.current = true;
                    const prev = experiencesRef.current;
                    const filtered = prev.filter(e => e.status === status);
                    const removed = prev.length - filtered.length;
                    
                    const newTotal = total - removed;
                    if (removed > 0) setTotal(t => t - removed);
                    
                    if (total > LIMIT && newTotal <= LIMIT && newTotal > 0) {
                        if (page !== 1) {
                            setPage(1);
                        } else {
                            fetchList(1, status, false);
                        }
                    } else if (filtered.length <= 5 && newTotal > filtered.length) {
                        if (page > 1 && newTotal <= (page - 1) * LIMIT) {
                            setPage(p => p - 1);
                        } else {
                            fetchList(page, status, false);
                        }
                    } else if (filtered.length === 0 && page > 1) {
                        setPage(p => p - 1);
                    }

                    setExperiences(filtered);
                }, 1200);
            }
        } catch {
            setExperiences(prev => prev.map(e => e._id === exp._id ? { ...e, status: exp.status } : e));
        }
    };

    const openDetail = async (exp) => {
        const res = await getExperienceDetail(exp._id);
        setDetail(res.data);
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="admin-page">
            <h2 className="admin-page-title">Experiences <span className="admin-page-count">{total} total</span></h2>
            <div className="admin-filters">
                {[["" ,"All"],["Active","Active"],["Inactive","Inactive"]].map(([val, label]) => (
                    <button key={val} className={`admin-filter-btn ${status === val ? "admin-filter-btn--active" : ""}`}
                        onClick={() => { setStatus(val); setPage(1); }}>{label}</button>
                ))}
            </div>
            {loading ? <div className="admin-loading">Loading...</div> : (
                <>
                    <div className="admin-cards">
                        {experiences.map((exp, i) => {
                            const adminMember = exp.members?.find(m => m.role === "admin");
                            const memberCount = (exp.memberCount ?? 0) - 1; // exclude admin
                            return (
                                <div key={exp._id} className="admin-card admin-card--clickable" onClick={() => openDetail(exp)}>
                                    <div className="admin-card__left">
                                        <span className="admin-card__num">{(page - 1) * LIMIT + i + 1}</span>
                                        <div className="admin-card__avatar admin-card__avatar--sq">
                                            {exp.image
                                                ? <img src={`http://localhost:3001/uploads/${exp.image}`} alt={exp.expname} />
                                                : <span>{exp.expname?.[0]?.toUpperCase()}</span>
                                            }
                                        </div>
                                        <div className="admin-card__info">
                                            <strong>{exp.expname}</strong>
                                            <span className="admin-card__details">{exp.description}</span>
                                        </div>
                                    </div>
                                    <div className="admin-card__meta">
                                        <div className="admin-card__field"><label>Code</label><code>{exp.code}</code></div>
                                        <div className="admin-card__field"><label>Products</label><span>{exp.productIds?.length || 0}</span></div>
                                        <div className="admin-card__field"><label>Members</label><span>{memberCount < 0 ? 0 : memberCount}</span></div>
                                        <div className="admin-card__field"><label>Created by</label><span>{adminMember?.userid?.name || "—"}</span></div>
                                    </div>
                                    <div className="admin-card__actions" onClick={e => e.stopPropagation()}>
                                        <Toggle active={exp.status === "Active"} onToggle={() => toggle(exp)} stopPropagation />
                                    </div>
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

            {detail && (
                <div className="admin-modal-overlay" onClick={() => setDetail(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <button className="admin-modal__close" onClick={() => setDetail(null)}>✕</button>
                        <div className="admin-modal__header">
                            {detail.exp.image && <img src={`http://localhost:3001/uploads/${detail.exp.image}`} alt={detail.exp.expname} className="admin-modal__img" />}
                            <div>
                                <h3>{detail.exp.expname}</h3>
                                <p>{detail.exp.title}</p>
                                <code>{detail.exp.code}</code>
                            </div>
                        </div>
                        <p className="admin-modal__desc">{detail.exp.description}</p>
                        <h4>Products ({detail.exp.productIds?.length || 0})</h4>
                        <div className="admin-modal__products">
                            {detail.exp.productIds?.map(p => (
                                <div key={p._id} className="admin-modal__product">
                                    <img src={`http://localhost:3001/uploads/${p.image}`} alt={p.name} />
                                    <span>{p.name}</span>
                                    <span>₹{p.price}</span>
                                </div>
                            ))}
                        </div>
                        <h4>Members ({detail.members?.filter(m => m.role !== "admin").length || 0})</h4>
                        <div className="admin-modal__members">
                            {detail.members?.map(m => (
                                <div key={m._id} className="admin-modal__member">
                                    {m.userid?.image
                                        ? <img src={`http://localhost:3001/uploads/${m.userid.image}`} alt={m.userid.name} />
                                        : <span className="admin-table__avatar">{m.userid?.name?.[0]}</span>
                                    }
                                    <div>
                                        <span>{m.userid?.name}</span>
                                        <small>{m.role}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageExperiences;
