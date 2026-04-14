import { FiHeart, FiShoppingCart } from "react-icons/fi";

const ProductCard = ({ product, wishlisted, onWish, onCart, badge, onAction, actionLabel, actionIcon }) => (
    <div className="product-card">
        <div className="product-image-wrapper">
            <img src={`http://localhost:3001/uploads/${product.image}`} alt={product.name} className="product-image" />
            {badge && <span className="product-badge">{badge}</span>}
            <div className="product-card-actions">
                <button className="product-heart-btn" onClick={onWish}>
                    <FiHeart size={20} style={{
                        color: "#F4785A",
                        fill: wishlisted ? "#F4785A" : "none",
                        transition: "fill 0.2s"
                    }} />
                </button>
                {onCart && (
                    <button className="product-cart-btn" onClick={onCart} title="Add to Cart">
                        <FiShoppingCart size={18} style={{ color: "#1A1A2E" }} />
                    </button>
                )}
            </div>
        </div>
        <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-details">{product.details}</p>
            <div className="product-footer">
                <span className="product-price">₹{product.price}</span>
                {onAction && (
                    <button className="product-btn" onClick={onAction}>
                        {actionIcon && actionIcon} {actionLabel}
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default ProductCard;
