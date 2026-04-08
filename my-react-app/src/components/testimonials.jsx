import { useEffect, useState, useRef } from "react";
import { getProducts, getProductsWithWish } from "../api/services";
import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useAuth } from "../context/authContext";
import useAuthAction, { SuccessToast } from "../hooks/useAuthAction";
import useWish from "../hooks/useWish";

const Testimonials = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [current, setCurrent] = useState(0);
    const trackRef = useRef(null);
    const { guard, successToast } = useAuthAction();
    const { addToWish } = useWish();

    const fetchProducts = () => {
        const call = token ? getProductsWithWish(1, 8) : getProducts(1, 8);
        call.then(res => setProducts(res.data.data)).catch(console.error);
    };

    useEffect(() => { fetchProducts(); }, [token]); 
    useEffect(() => {
        if (!products.length) return;
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % products.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [products]);

    useEffect(() => {
        if (trackRef.current) {
            const card = trackRef.current.firstElementChild;
            if (card) {
                const offset = card.offsetWidth + 24;
                trackRef.current.style.transform = `translateX(-${current * offset}px)`;
            }
        }
    }, [current]);

    if (!products.length) return null;

    const colors = ["#F4785A", "#1A1A2E", "#F9A4A4"];
    const sizes = ["S", "M", "XL"];

    return (
        <>
        <section className="trending">
            <div className="trending__header">
                <h2 className="trending__title">Trending This Month</h2>
                <div className="trending__dots">
                    {products.map((_, i) => (
                        <span key={i} className={`trending__dot ${i === current ? "trending__dot--active" : ""}`} onClick={() => setCurrent(i)} />
                    ))}
                </div>
            </div>

            <div className="trending__viewport">
                <div className="trending__track" ref={trackRef}>
                    {products.map((product, i) => (
                        <div className="trending__card" key={product._id} style={{ background: i % 3 === 2 ? "#F4785A" : "#fff" }}>
                            <div className="trending__card-info">
                                <h3 className="trending__card-name" style={{ color: i % 3 === 2 ? "#fff" : "#1A1A2E" }}>{product.name}</h3>
                                <p className="trending__card-desc" style={{ color: i % 3 === 2 ? "rgba(255,255,255,0.75)" : "#AAAAAA" }}>
                                    {product.details.substring(0, 50)}
                                </p>
                                <div className="trending__card-row">
                                    <div>
                                        <span className="trending__card-label" style={{ color: i % 3 === 2 ? "rgba(255,255,255,0.7)" : "#AAAAAA" }}>Price</span>
                                        <span className="trending__card-price" style={{ color: i % 3 === 2 ? "#fff" : "#1A1A2E" }}>${product.price}</span>
                                    </div>
                                    <div>
                                        <span className="trending__card-label" style={{ color: i % 3 === 2 ? "rgba(255,255,255,0.7)" : "#AAAAAA" }}>Color</span>
                                        <div className="trending__card-colors">
                                            {colors.map(c => <span key={c} className="trending__card-color" style={{ background: c }} />)}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="trending__card-label" style={{ color: i % 3 === 2 ? "rgba(255,255,255,0.7)" : "#AAAAAA" }}>Size</span>
                                        <div className="trending__card-sizes">
                                            {sizes.map(s => <span key={s} className="trending__card-size" style={{ color: i % 3 === 2 ? "#fff" : "#1A1A2E", borderColor: i % 3 === 2 ? "rgba(255,255,255,0.4)" : "#EEEEEE" }}>{s}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <div className={`trending__card-actions ${i % 3 === 2 ? "trending__card-actions--orange" : ""}`}>
                                    <button className="trending__card-btn" style={{ background: i % 3 === 2 ? "#fff" : "#F4785A", color: i % 3 === 2 ? "#F4785A" : "#fff" }}
                                        onClick={() => navigate("/product")}>
                                        Shop now
                                    </button>
                                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                                        onClick={() => guard(() => addToWish(product._id, fetchProducts))}>
                                        <FiHeart size={20} style={{
                                            color: i % 3 === 2 ? "#fff" : "#F4785A",
                                            fill: product.wishlisted ? (i % 3 === 2 ? "#fff" : "#F4785A") : "none",
                                            transition: "fill 0.2s"
                                        }} />
                                    </button>
                                </div>
                            </div>
                            <div className="trending__card-img">
                                <img src={`http://localhost:3001/uploads/${product.image}`} alt={product.name} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        <SuccessToast show={successToast.show} message={successToast.message} type={successToast.type} />
        </>
    );
};

export default Testimonials;
