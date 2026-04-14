import { getWishlist } from "../../api/services";
import { addToCart } from "../../api/services";
import { useState, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { SuccessToast } from "../../hooks/useAuthAction";
import useAuthAction from "../../hooks/useAuthAction";
import "../pages.css";
import useWish from "../../hooks/useWish";
import ProductCard from "../../components/ProductCard";

const Wishlist = () => {
    const { addToWish } = useWish();
    const { successToast, showSuccess } = useAuthAction();
    const [wishlist, setWishlist] = useState([]);

    const fetchWishlist = () => {
        getWishlist()
        .then(res => setWishlist(res.data))
        .catch(console.error);
    };

    useEffect(() => { fetchWishlist(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId);
            showSuccess("Added to cart!", "success");
        } catch { showSuccess("Failed to add to cart", "error"); }
    };

    return (
        <>
        <div className="products-page">
            <div className="products-header">
                <div>
                    <h2 className="products-title">My Wishlist</h2>
                    <p className="products-subtitle">{wishlist.length} saved items</p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <p className="products-empty">Your wishlist is empty.</p>
            ) : (
                <div className="products-grid">
                    {wishlist.map((item) => {
                        const p = item.productid;
                        if (!p) return null;
                        return (
                            <ProductCard
                                key={item._id}
                                product={p}
                                wishlisted={true}
                                onWish={() => addToWish(p._id, fetchWishlist)}
                                badge="Saved"
                                onAction={() => handleAddToCart(p._id)}
                                actionLabel="Add to Cart"
                                actionIcon={<FiShoppingCart size={14} />}
                            />
                        );
                    })}
                </div>
            )}
        </div>
        <SuccessToast show={successToast.show} message={successToast.message} type={successToast.type} />
        </>
    );
};

export default Wishlist;