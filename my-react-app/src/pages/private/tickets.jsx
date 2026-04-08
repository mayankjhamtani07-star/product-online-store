import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TicketForm from "../../components/ticketForm";
import { getTickets, createTicket } from "../../api/services";
import "../pages.css";

const fmt = (date) => date
    ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "—";

const Tickets = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("Open");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchTickets = (status) => {
        setLoading(true);
        getTickets(status)
            .then(res => setTickets(res.data.data))
            .catch(() => setTickets([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTickets(filterStatus); setCurrentPage(1); }, [filterStatus]); // eslint-disable-line

    const filteredTickets = tickets;

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    const displayed = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (showForm) return (
        <div className="tickets-page-container">
            <h2 className="tickets-page-title">My Tickets</h2>
            <TicketForm fetchTickets={() => fetchTickets(filterStatus)} setShowFrom={setShowForm} createTicket={createTicket} />
        </div>
    );

    return (
        <div className="tickets-page-container">
            <h2 className="tickets-page-title">My Tickets</h2>
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
                                <tr key={ticket._id}>
                                    <td className="td-id" onClick={() => navigate(`/ticket/${ticket._id}`)}>
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
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTickets.length)} – {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} rows
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
