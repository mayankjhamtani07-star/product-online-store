import { useState, useEffect } from "react";
import { getOrders } from "../../api/services";
import { FiPackage, FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../pages.css";

const fmt = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const statusColor = {
    Pending:    { bg: "#FFF8E1", color: "#F59E0B" },
    Processing: { bg: "#EEF0FD", color: "#7b7fe8" },
    Shipped:    { bg: "#E3F2FD", color: "#1976D2" },
    Delivered:  { bg: "#EDFAF3", color: "#27AE60" },
    Cancelled:  { bg: "#FFF0ED", color: "#E05A3A" },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        getOrders()
            .then(res => setOrders(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="orders-page"><p style={{ color: "#aaa" }}>Loading...</p></div>;

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h2 className="orders-title">My Orders</h2>
                <p className="orders-sub">{orders.length} {orders.length === 1 ? "order" : "orders"}</p>
            </div>

            {orders.length === 0 ? (
                <div className="exp-empty">
                    <FiPackage size={48} color="#DDDDDD" />
                    <h3>No orders yet</h3>
                    <p>Place your first order from the cart.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order, i) => {
                        const s = statusColor[order.status] || statusColor.Pending;
                        const isOpen = expanded === order._id;
                        return (
                            <div key={order._id} className="order-card">
                                <div className="order-card__header" onClick={() => setExpanded(isOpen ? null : order._id)}>
                                    <div className="order-card__left">
                                        <span className="order-card__num">#{String(orders.length - i).padStart(4, "0")}</span>
                                        <div className="order-card__info">
                                            <p className="order-card__date">{fmt(order.createdAt)}</p>
                                            <p className="order-card__count">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                                        </div>
                                    </div>
                                    <div className="order-card__right">
                                        <span className="order-card__total">₹{order.total.toFixed(2)}</span>
                                        <span className="order-card__status" style={{ background: s.bg, color: s.color }}>
                                            {order.status}
                                        </span>
                                        {isOpen ? <FiChevronUp size={16} color="#888" /> : <FiChevronDown size={16} color="#888" />}
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="order-card__items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <div className="order-item__img">
                                                    <img src={`http://localhost:3001/uploads/${item.image}`} alt={item.name} />
                                                </div>
                                                <p className="order-item__name">{item.name}</p>
                                                <p className="order-item__price">₹{item.price.toFixed(2)}</p>
                                            </div>
                                        ))}
                                        <div className="order-card__summary">
                                            <span>Subtotal: ₹{order.subtotal.toFixed(2)}</span>
                                            <span>Shipping: ₹{order.shipping.toFixed(2)}</span>
                                            <strong>Total: ₹{order.total.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
