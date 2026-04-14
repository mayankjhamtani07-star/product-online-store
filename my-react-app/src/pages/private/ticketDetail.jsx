import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicketById, replyToTicket, reopenTicket } from "../../api/services";
import { FiArrowLeft, FiPaperclip } from "react-icons/fi";
import "../pages.css";
import { socket } from "../../config/socket";

const fmt = (date) => date
    ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "—";

const TicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("activity");
    const [replyMsg, setReplyMsg] = useState("");
    const [replying, setReplying] = useState(false);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        getTicketById(ticketId)
            .then(res => setTicket(res.data.ticket))
            .catch(() => navigate("/ticket"))
            .finally(() => setLoading(false));
    }, [ticketId]); // eslint-disable-line

    useEffect(() => {
        if (ticket?.replies && activeTab === "activity") {
            scrollToBottom();
        }
    }, [ticket?.replies, activeTab]);

    useEffect(() => {
        socket.emit("join_ticket", ticketId);
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
    }, [ticketId]);
    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMsg.trim()) return;
        setReplying(true);
        try {
            await replyToTicket(ticket._id, replyMsg);
            setReplyMsg("");
            const res = await getTicketById(ticketId);
            setTicket(res.data.ticket);
        } catch (err) { console.error(err); }
        finally { setReplying(false); }
    };

    const handleReopen = async () => {
        try {
            await reopenTicket(ticket._id);
            const res = await getTicketById(ticketId);
            setTicket(res.data.ticket);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="tickets-page-container"><p>Loading...</p></div>;
    if (!ticket) return null;

    const t = ticket;

    return (
        <div className="ticket-detail-page">
            <div className="ticket-detail-topbar">
                <button className="ticket-detail-back" onClick={() => navigate("/ticket")}>
                    <FiArrowLeft size={15} /> Back to Tickets
                </button>
                {t.status === "Closed" && (
                    <button className="ticket-reopen-btn" onClick={handleReopen}>Re Open</button>
                )}
            </div>

            <div className="ticket-detail-card">
                <h2 className="ticket-detail-subject">{t.subject}</h2>

                <div className="ticket-detail-meta">
                    <span>Opened: <strong>{fmt(t.createdAt)}</strong></span>
                    <span>Status: <strong className={t.status === "Open" ? "td-status-open" : "td-status-closed"}>{t.status}</strong></span>
                    {t.closedAt && <span>Closed Date: <strong>{fmt(t.closedAt)}</strong></span>}
                </div>

                <div className="ticket-detail-section">
                    <p className="ticket-detail-label">Description:</p>
                    <p className="ticket-detail-desc">{t.description}</p>
                </div>

                <div className="ticket-detail-tabs">
                    <button className={`ticket-tab ${activeTab === "activity" ? "ticket-tab--active" : ""}`}
                        onClick={() => setActiveTab("activity")}>
                        Activity ({t.replies?.length || 0})
                    </button>
                    <button className={`ticket-tab ${activeTab === "attachments" ? "ticket-tab--active" : ""}`}
                        onClick={() => setActiveTab("attachments")}>
                        <FiPaperclip size={13} /> Attachments ({t.attachments?.length || 0})
                    </button>
                </div>

                {activeTab === "activity" && (
                    <div className="ticket-activity">
                        <div className="ticket-activity-body" ref={messagesEndRef}>
                            {(!t.replies || t.replies.length === 0) && (
                                <p className="ticket-no-reply">No activity yet. Waiting for support response.</p>
                            )}
                            {t.replies?.map((r, idx) => {
                                const isSender = r.senderRole === "user";
                                return (
                                    <div key={idx} className={`ticket-reply-wrapper ${isSender ? "ticket-reply-wrapper--sender" : "ticket-reply-wrapper--receiver"}`}>
                                        <div className={`ticket-reply-bubble ${isSender ? "ticket-reply-bubble--sender" : "ticket-reply-bubble--receiver"}`}>
                                            <div className="ticket-reply-header">
                                                <strong>{isSender ? "You" : "Support Team"}</strong>
                                                <small>{fmt(r.createdAt)}</small>
                                            </div>
                                            <p>{r.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {(t.status === "Open" || t.status === "In Progress") && (
                            <form className="ticket-reply-form" onSubmit={handleReply}>
                                <textarea placeholder="Write your reply..." value={replyMsg}
                                    onChange={e => setReplyMsg(e.target.value)} required />
                                <button type="submit" disabled={replying}>
                                    {replying ? "Sending..." : "Send Reply"}
                                </button>
                            </form>
                        )}
                        {t.status === "Closed" && (
                            <p className="ticket-closed-note">
                                This ticket is closed. Click "Re Open" to reopen it or raise a new ticket.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === "attachments" && (
                    <div className="ticket-attachments">
                        {!t.attachments?.length
                            ? <p className="ticket-no-reply">No attachments.</p>
                            : t.attachments.map((f, i) => (
                                <a key={i} href={`http://localhost:3001/uploads/${f}`}
                                    target="_blank" rel="noreferrer" className="ticket-attachment-link">
                                    <FiPaperclip size={14} /> {f.split("/").pop()}
                                </a>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetail;
