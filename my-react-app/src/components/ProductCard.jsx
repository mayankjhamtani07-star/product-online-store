import { FiHeart } from "react-icons/fi";

const ProductCard = ({ product, wishlisted, onWish, badge, onAction, actionLabel, actionIcon }) => (
    <div className="product-card">
        <div className="product-image-wrapper">
            <img src={`http://localhost:3001/uploads/${product.image}`} alt={product.name} className="product-image" />
            {badge && <span className="product-badge">{badge}</span>}
            <button className="product-heart-btn" onClick={onWish}>
                <FiHeart size={24} style={{
                    color: "#F4785A",
                    fill: wishlisted ? "#F4785A" : "none",
                    transition: "fill 0.2s"
                }} />
            </button>
        </div>
        <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-details">{product.details}</p>
            <div className="product-footer">
                <span className="product-price">${product.price}</span>
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
