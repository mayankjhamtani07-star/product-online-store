import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminTicketById, adminReplyTicket, adminUpdateTicketStatus } from "../api/services";
import { FiArrowLeft, FiUser, FiClock, FiFileText, FiPaperclip } from "react-icons/fi";
import "./pages.css";
import { socket } from "../../config/socket";

const fmt = (date) => date
    ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const fmtFull = (date) => date
    ? new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyMsg, setReplyMsg] = useState("");
    const [replying, setReplying] = useState(false);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        getAdminTicketById(id)
            .then(res => setTicket(res.data.ticket))
            .catch(() => navigate("/admin/ticket"))
            .finally(() => setLoading(false));
    }, [id]); // eslint-disable-line

    useEffect(() => {
        if (ticket?.replies) {
            scrollToBottom();
        }
    }, [ticket?.replies]);

    useEffect(() => {
        socket.emit("join_ticket", id);
        socket.on("new_reply", (reply) => {
            setTicket(prev => {
                if (!prev) return prev;
                return { ...prev, replies: [...(prev.replies || []), reply] };
            });
        });
        socket.on("ticket_status_changed", ({ status }) => {
            setTicket(prev => ({ ...prev, status }));
        });
        return () => {
            socket.off("new_reply");
            socket.off("ticket_status_changed");
        };
    }, [id]);
    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMsg.trim()) return;
        setReplying(true);
        try {
            await adminReplyTicket(ticket._id, replyMsg);
            setReplyMsg("");
            const res = await getAdminTicketById(id);
            setTicket(res.data.ticket);
        } catch (err) { console.error(err); }
        finally { setReplying(false); }
    };

    const handleStatusUpdate = async (status) => {
        try {
            await adminUpdateTicketStatus(ticket._id, status);
            const res = await getAdminTicketById(id);
            setTicket(res.data.ticket);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="admin-page"><div className="admin-loading">Loading...</div></div>;
    if (!ticket) return null;

    const t = ticket;

    return (
        <div className="admin-page">
            <div className="admin-ticket-topbar">
                <button className="admin-ticket-back" onClick={() => navigate(-1)}>
                    <FiArrowLeft size={16} /> Back to Tickets
                </button>
                <div className="admin-ticket-topbar-right">
                    <span className={`admin-badge admin-badge--${t.status.toLowerCase().replace(" ", "")}`}>
                        {t.status}
                    </span>
                    {t.status === "Open" && (
                        <button className="admin-inprogress-ticket-btn" onClick={() => handleStatusUpdate("In Progress")}>In Progress</button>
                    )}
                    {t.status === "In Progress" && (
                        <button className="admin-close-ticket-btn" onClick={() => handleStatusUpdate("Closed")}>Close Ticket</button>
                    )}
                </div>
            </div>

            <div className="admin-ticket-detail-wrap">
                <div className="admin-ticket-main">
                    {/* Info card */}
                    <div className="admin-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                        <h2 className="admin-ticket-subject">{t.subject}</h2>
                        <div className="admin-ticket-meta">
                            <span><FiUser size={13} /> {t.userId?.name}</span>
                            <span><FiClock size={13} /> {fmtFull(t.createdAt)}</span>
                            {t.closedAt && <span>Closed: {fmt(t.closedAt)}</span>}
                        </div>
                        <p className="admin-ticket-desc">{t.description}</p>

                        {t.attachments?.length > 0 && (
                            <div className="admin-ticket-attachments">
                                <p className="admin-ticket-attach-label"><FiPaperclip size={13} /> Attachments ({t.attachments.length})</p>
                                <div className="admin-ticket-attach-grid">
                                    {t.attachments.map((f, i) => {
                                        const isImg = /\.(jpg|jpeg|png|webp)$/i.test(f);
                                        return isImg ? (
                                            <a key={i} href={`http://localhost:3001/uploads/${f}`} target="_blank" rel="noreferrer">
                                                <img src={`http://localhost:3001/uploads/${f}`} alt="attachment" className="admin-ticket-attach-img" />
                                            </a>
                                        ) : (
                                            <a key={i} href={`http://localhost:3001/uploads/${f}`} target="_blank" rel="noreferrer" className="admin-ticket-attach-file">
                                                <FiFileText size={20} /> {f.split("/").pop()}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Conversation */}
                    <div className="admin-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: 14, marginTop: 16 }}>
                        <h3 className="admin-ticket-conv-title">Conversation ({t.replies?.length || 0})</h3>
                        <div className="admin-ticket-conv-body" ref={messagesEndRef}>
                            {(!t.replies || t.replies.length === 0) && (
                                <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>No replies yet.</p>
                            )}
                            {t.replies?.map((r, idx) => {
                                const isSender = r.senderRole === "admin";
                                return (
                                    <div key={idx} className={`admin-reply-wrapper ${isSender ? "admin-reply-wrapper--sender" : "admin-reply-wrapper--receiver"}`}>
                                        <div className={`admin-reply-bubble ${isSender ? "admin-reply-bubble--sender" : "admin-reply-bubble--receiver"}`}>
                                            <div className="admin-reply-header">
                                                <strong>{isSender ? "Support Team (You)" : t.userId?.name}</strong>
                                                <small>{fmtFull(r.createdAt)}</small>
                                            </div>
                                            <p>{r.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {t.status !== "Closed" && (
                            <form className="admin-reply-form" onSubmit={handleReply}>
                                <textarea placeholder="Write your response..." value={replyMsg}
                                    onChange={e => setReplyMsg(e.target.value)} required />
                                <button type="submit" className="admin-add-btn" disabled={replying}>
                                    {replying ? "Sending..." : "Send Reply"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Side col */}
                <div className="admin-ticket-side">
                    <div className="admin-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                        <h4 className="admin-ticket-side-title">Customer Details</h4>
                        <div className="admin-ticket-info-row"><label>Name</label><span>{t.userId?.name}</span></div>
                        <div className="admin-ticket-info-row"><label>Email</label><span>{t.userId?.email}</span></div>
                        <div className="admin-ticket-info-row"><label>Opened</label><span>{fmt(t.createdAt)}</span></div>
                        {t.closedAt && <div className="admin-ticket-info-row"><label>Closed</label><span>{fmt(t.closedAt)}</span></div>}
                        <div className="admin-ticket-info-row"><label>Replies</label><span>{t.replies?.length || 0}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
