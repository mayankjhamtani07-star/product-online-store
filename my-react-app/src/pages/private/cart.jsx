import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeFromCart, clearCart, createPayment, verifyPayment } from "../../api/services";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";
import "../pages.css";
import { useAuth } from "../../context/authContext";

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    const fetchCart = () => {
        getCart()
            .then(res => setItems(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCart(); }, []);

    const handleRemove = async (id) => {
        await removeFromCart(id);
        fetchCart();
    };

    const handleClear = async () => {
        await clearCart();
        setItems([]);
    };

    const handleCheckout = async () => {
        setPlacing(true);
        try {
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement("script");
                    s.src = "https://checkout.razorpay.com/v1/checkout.js";
                    s.onload = resolve;
                    s.onerror = reject;
                    document.body.appendChild(s);
                });
            }
            const amountToCharge = total + shipping;
            console.log("[Checkout] Starting payment, amount:", amountToCharge);

            const paymentRes = await createPayment(amountToCharge);
            const razorpayOrder = paymentRes.data.order;
            console.log("[Checkout] Razorpay order created:", razorpayOrder);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: "INR",
                name: "Online Store",
                description: "Order Payment",
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    console.log("[Checkout] Payment success response:", response);
                    try {
                        const res = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        console.log("[Checkout] Verify response:", res.data);
                        if (res.data.order) navigate("/orders");
                    } catch (verifyErr) {
                        console.error("[Checkout] Verify failed:", verifyErr.response?.data || verifyErr.message);
                        setPlacing(false);
                    }
                },
                prefill: { name: user?.name || "", email: user?.email || "" },
                theme: { color: "#F4785A" },
                modal: { ondismiss: () => { console.log("[Checkout] Modal dismissed"); setPlacing(false); } }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (resp) => {
                console.error("[Checkout] Payment FAILED:", resp.error);
                setPlacing(false);
            });
            rzp.open();

        } catch (err) {
            console.error("[Checkout] createPayment failed:", err.response?.data || err.message);
            setPlacing(false);
        }
    };


    const total = items.reduce((sum, item) => sum + (item.productid?.price || 0), 0);
    const shipping = items.length > 0 ? 5.99 : 0;

    if (loading) return <div className="cart-page"><p style={{ color: "#aaa" }}>Loading...</p></div>;

    return (
        <div className="cart-page">
            <div className="cart-header">
                <div>
                    <h2 className="cart-title">My Cart</h2>
                    <p className="cart-sub">{items.length} {items.length === 1 ? "item" : "items"}</p>
                </div>
                {items.length > 0 && (
                    <button className="cart-clear-btn" onClick={handleClear}>
                        <FiTrash2 size={14} /> Clear Cart
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="exp-empty">
                    <FiShoppingCart size={48} color="#DDDDDD" />
                    <h3>Your cart is empty</h3>
                    <p>Add products to your cart to see them here.</p>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items">
                        {items.map(item => {
                            const p = item.productid;
                            if (!p) return null;
                            return (
                                <div key={item._id} className="cart-item">
                                    <div className="cart-item__img">
                                        <img src={`http://localhost:3001/uploads/${p.image}`} alt={p.name} />
                                    </div>
                                    <div className="cart-item__info">
                                        <p className="cart-item__name">{p.name}</p>
                                        <p className="cart-item__details">{p.details}</p>
                                    </div>
                                    <div className="cart-item__controls">
                                        <p className="cart-item__subtotal">₹{p.price.toFixed(2)}</p>
                                        <button className="cart-item__remove" onClick={() => handleRemove(item._id)}>
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <h3 className="cart-summary__title">Order Summary</h3>
                        <div className="cart-summary__rows">
                            <div className="cart-summary__row">
                                <span>Subtotal ({items.length} items)</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                            <div className="cart-summary__row">
                                <span>Shipping</span>
                                <span>₹{shipping.toFixed(2)}</span>
                            </div>
                            <div className="cart-summary__row cart-summary__row--total">
                                <span>Total</span>
                                <span>₹{(total + shipping).toFixed(2)}</span>
                            </div>
                        </div>
                        <button className="cart-checkout-btn" onClick={handleCheckout} disabled={placing}>
                            {placing ? "Placing Order..." : "Proceed to Checkout"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
