import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/authContext";
import TicketForm from "../../components/ticketForm";
import { createTicketFire } from "../../api/services";
import "../pages.css";

const fmt = (date) => {
    if (!date) return "—";
    const d = date?.seconds ? new Date(date.seconds * 1000) : date?.toDate ? date.toDate() : new Date(date);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const Tickets = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("Open");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // extract userId from JWT token since login only stores name+image in user object
    const getUserId = () => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.id;
        } catch { return null; }
    };

    useEffect(() => {
        const userId = getUserId();
        if (!userId) return;
        setLoading(true);
        setCurrentPage(1);

        const statusFilter = filterStatus === "Open"
            ? ["Open", "In Progress"]
            : ["Closed"];

        const q = query(
            collection(db, "tickets"),
            where("userId", "==", userId),
            where("status", "in", statusFilter)
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const at = a.createdAt?.seconds ?? new Date(a.createdAt).getTime() / 1000;
                    const bt = b.createdAt?.seconds ?? new Date(b.createdAt).getTime() / 1000;
                    return bt - at;
                });
            setTickets(data);
            setLoading(false);
        }, () => { setTickets([]); setLoading(false); });

        return () => unsub();
    }, [filterStatus, token]); // eslint-disable-line

    const totalPages = Math.ceil(tickets.length / itemsPerPage);
    const displayed = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (showForm) return (
        <div className="tickets-page-container">
            <h2 className="tickets-page-title">My Tickets <span style={{ fontSize: 13, fontWeight: 600, background: "#e8f8f0", color: "#27ae60", padding: "3px 10px", borderRadius: 50, marginLeft: 10, verticalAlign: "middle" }}>🔴 Live</span></h2>
            <TicketForm fetchTickets={() => {}} setShowFrom={setShowForm} createTicket={createTicketFire} />
        </div>
    );

    return (
        <div className="tickets-page-container">
            <h2 className="tickets-page-title">My Tickets <span style={{ fontSize: 13, fontWeight: 600, background: "#e8f8f0", color: "#27ae60", padding: "3px 10px", borderRadius: 50, marginLeft: 10, verticalAlign: "middle" }}>🔴 Live</span></h2>
            <div className="tickets-table-card">
                <div className="tickets-table-header">
                    <select className="tickets-status-select" value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}>
                        <option value="Open">My Open Tickets</option>
                        <option value="Closed">My Closed Tickets</option>
                    </select>
                    <button className="tickets-new-btn" onClick={() => setShowForm(true)}>+ New Ticket</button>
                </div>

                <div className="tickets-table-wrapper">
                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Subject</th>
                                <th>Open Date</th>
                                <th>Status</th>
                                {filterStatus === "Closed" && <th>Close Date</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="td-empty">Loading...</td></tr>
                            ) : displayed.length === 0 ? (
                                <tr><td colSpan={5} className="td-empty">No tickets found</td></tr>
                            ) : displayed.map((ticket, i) => (
                                <tr key={ticket.id}>
                                    <td className="td-id" onClick={() => navigate(`/ticket-fire/${ticket.id}`)}>
                                        #{(currentPage - 1) * itemsPerPage + i + 1000}
                                    </td>
                                    <td className="td-subject">{ticket.subject}</td>
                                    <td>{fmt(ticket.createdAt)}</td>
                                    <td><span className={`status-badge ${ticket.status?.toLowerCase()}`}>{ticket.status}</span></td>
                                    {filterStatus === "Closed" && <td>{fmt(ticket.closedAt)}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="tickets-table-footer">
                    <div className="pagination-info">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, tickets.length)} – {Math.min(currentPage * itemsPerPage, tickets.length)} of {tickets.length} rows
                    </div>
                    <div className="pagination-controls">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>›</button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)}>»</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tickets;
