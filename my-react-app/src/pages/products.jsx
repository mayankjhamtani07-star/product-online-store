import { useEffect, useState, useRef, forwardRef, lazy, Suspense } from "react";
import { getProducts, getProductsWithWish, searchProducts, filterProducts, getExistingExperiences, addProductToExperience } from "../api/services";
import { addToCart } from "../api/services";
import { useAuth } from "../context/authContext";
import "./pages.css";
import useAuthAction, { LoginToast, SuccessToast } from "../hooks/useAuthAction";
import { getSubcategoriesByIds } from "../api/services";
const AddExperience = lazy(() => import("../components/addExperience"));
import useWish from "../hooks/useWish";
import useCategories from "../hooks/useCategories";
import ProductCard from "../components/ProductCard";

const Products = forwardRef((props, ref) => {
    const { token } = useAuth();
    const { guard, toast, successToast, showSuccess } = useAuthAction();
    const { addToWish } = useWish();
    const { categories, subcategories, setSubcategories, fetchCategories, fetchSubcategories } = useCategories();

    const [Experience, setExperience] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [selectedExp, setSelectedExp] = useState("");
    const [search, setSearch] = useState(() => sessionStorage.getItem("prod_search") || "");
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(() => Number(sessionStorage.getItem("prod_page")) || 1);
    const PAGE_SIZE = 12;
    const [catOpen, setCatOpen] = useState(false);
    const [subCatOpen, setSubCatOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(() => JSON.parse(sessionStorage.getItem("prod_cat") || "[]"));
    const [selectedSubcategory, setSelectedSubcategory] = useState(() => JSON.parse(sessionStorage.getItem("prod_subcat") || "[]"));
    const pageBeforeSearch = useRef(Number(sessionStorage.getItem("prod_page")) || 1);

    const productIdRef = useRef(null);
    const filterRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setCatOpen(false);
                setSubCatOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const fetchProducts = (page) => {
        const call = token ? getProductsWithWish(page, PAGE_SIZE) : getProducts(page, PAGE_SIZE);
        call.then((res) => { setProducts(res.data.data); setTotal(res.data.total); })
            .catch(console.error);
    };

    const fetchExp = () => {
        getExistingExperiences()
            .then((res) => setExperience(res.data))
            .catch(console.error);
    };

    const addProductInExp = async () => {
        if (!selectedExp) return;
        try {
            const res = await addProductToExperience(productIdRef.current, selectedExp);
            showSuccess(res.data.message);
            setShowOld(false);
            setShowButton(false);
            productIdRef.current = null;
            setSelectedExp("");
            fetchProducts(page);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 409) {
                showSuccess(err.response.data.message, "info");
            } else {
                showSuccess(err?.response?.data?.message || "Something went wrong.", "error");
            }
        }
    };

    const fetchFiltered = async (p) => {
        if (search.trim()) {
            try {
                const res = await searchProducts(search, p, PAGE_SIZE);
                setProducts(res.data.data); setTotal(res.data.total);
            } catch (err) {
                if (err?.response?.status === 404) { setProducts([]); setTotal(0); }
            }
        } else {
            const params = new URLSearchParams();
            selectedCategory.forEach(id => params.append("categoryId", id));
            selectedSubcategory.forEach(id => params.append("subcategoryId", id));
            params.append("page", p); params.append("limit", PAGE_SIZE);
            try {
                const res = await filterProducts(params);
                setProducts(res.data.data); setTotal(res.data.total);
            } catch (err) {
                if (err?.response?.status === 404) { setProducts([]); setTotal(0); }
            }
        }
    };

    useEffect(() => {
        if (search.trim() || selectedCategory.length > 0 || selectedSubcategory.length > 0) return;
        fetchProducts(page);
    }, [token, page]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { if (!token) return; fetchExp(); }, [showOld, token]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!catOpen || categories.length > 0) return;
        fetchCategories();
    }, [catOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!subCatOpen) return;
        if (selectedCategory.length === 0) {
            fetchSubcategories();
        } else {
            const params = new URLSearchParams();
            selectedCategory.forEach(id => params.append("categoryId", id));
            getSubcategoriesByIds(params)
                .then(res => setSubcategories(res.data))
                .catch(() => setSubcategories([]));
        }
    }, [subCatOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setSelectedSubcategory([]);
        if (!subCatOpen) return;
        if (selectedCategory.length === 0) {
            fetchSubcategories();
        } else {
            const params = new URLSearchParams();
            selectedCategory.forEach(id => params.append("categoryId", id));
            getSubcategoriesByIds(params)
                .then(res => setSubcategories(res.data))
                .catch(() => setSubcategories([]));
        }
    }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    const isFirstRender = useRef(true);
    useEffect(() => {
        sessionStorage.setItem("prod_search", search);
        sessionStorage.setItem("prod_cat", JSON.stringify(selectedCategory));
        sessionStorage.setItem("prod_subcat", JSON.stringify(selectedSubcategory));

        const isFiltering = search.trim() || selectedCategory.length > 0 || selectedSubcategory.length > 0;
        if (!isFiltering) {
            if (isFirstRender.current) { isFirstRender.current = false; return; }
            const restored = pageBeforeSearch.current;
            pageBeforeSearch.current = 1;
            if (restored > 1) { setPage(restored); }
            else if (page === 1) fetchProducts(1);
            else setPage(1);
            return;
        }
        isFirstRender.current = false;
        const timer = setTimeout(async () => {
            if (page !== 1) pageBeforeSearch.current = page;
            setPage(1);
            sessionStorage.setItem("prod_page", "1");
            await fetchFiltered(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, selectedSubcategory]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        sessionStorage.setItem("prod_page", String(page));
        const isFiltering = search.trim() || selectedCategory.length > 0 || selectedSubcategory.length > 0;
        if (!isFiltering) return;
        fetchFiltered(page);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="products-page" ref={ref}>
            <div className="products-header">
                <div>
                    <h2 className="products-title">Our Products</h2>
                    <p className="products-subtitle">Browse our latest collection</p>
                </div>

            </div>
            <div className="products-search-filter" ref={filterRef}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => { setCatOpen(false); setSubCatOpen(false); }}
                />
                <div className="filter-group">
                    <div className={`filter-label ${catOpen ? "open" : ""}`} onClick={() => setCatOpen(p => !p)}>
                        Categories {selectedCategory.length > 0 && `(${selectedCategory.length})`}
                        {selectedCategory.length > 0
                            ? <span onClick={e => { e.stopPropagation(); setSelectedCategory([]); setSelectedSubcategory([]); }} style={{marginLeft:"auto",cursor:"pointer",color:"#F4785A",fontWeight:700,fontSize:"1rem",lineHeight:1}}>×</span>
                            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                    </div>
                    {catOpen && (
                        <div className="filter-dropdown">
                            {categories.map(cat => (
                                <label key={cat._id} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        value={cat._id}
                                        checked={selectedCategory.includes(cat._id)}
                                        onChange={e => {
                                            setSelectedCategory(prev =>
                                                e.target.checked ? [...prev, cat._id] : prev.filter(id => id !== cat._id)
                                            );
                                            setSelectedSubcategory([]);
                                        }}
                                    />
                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <div className="filter-group">
                    <div className={`filter-label ${subCatOpen ? "open" : ""}`} onClick={() => setSubCatOpen(p => !p)}>
                        Subcategories {selectedSubcategory.length > 0 && `(${selectedSubcategory.length})`}
                        {selectedSubcategory.length > 0
                            ? <span onClick={e => { e.stopPropagation(); setSelectedSubcategory([]); }} style={{marginLeft:"auto",cursor:"pointer",color:"#F4785A",fontWeight:700,fontSize:"1rem",lineHeight:1}}>×</span>
                            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                    </div>
                    {subCatOpen && (
                        <div className="filter-dropdown">
                            {subcategories.map(sub => (
                                <label key={sub._id} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        value={sub._id}
                                        checked={selectedSubcategory.includes(sub._id)}
                                        onChange={e => {
                                            setSelectedSubcategory(prev =>
                                                e.target.checked ? [...prev, sub._id] : prev.filter(id => id !== sub._id)
                                            );
                                        }}
                                    />
                                    {sub.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {products.length === 0 ? (
                <p className="products-empty">No Products Found.</p>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            wishlisted={product.wishlisted}
                            onWish={() => guard(() => addToWish(product._id, () => fetchProducts(page)))}
                            onCart={() => guard(() => addToCart(product._id)
                                .then(() => showSuccess("Added to cart!", "success"))
                                .catch(err => showSuccess(err?.response?.data?.message || "Failed", "error")))}
                            badge="New"
                            onAction={() => guard(() => { productIdRef.current = product._id; setShowButton(true); })}
                            actionLabel="Add to Experience"
                        />
                    ))}
                </div>
            )}

            {total > PAGE_SIZE && (
                <div className="pagination">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                    {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => (
                        <button key={i + 1} onClick={() => setPage(i + 1)} className={page === i + 1 ? "active" : ""}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPage(p => p + 1)} disabled={page === Math.ceil(total / PAGE_SIZE)}>›</button>
                    <span className="pagination-total">{total} product{total !== 1 ? "s" : ""}</span>
                </div>
            )}

            <LoginToast show={toast} />
            <SuccessToast show={successToast.show} message={successToast.message} type={successToast.type} />

            {showButton && (
                <div className="exp-modal-overlay" onClick={() => { setShowButton(false); productIdRef.current = null; }}>
                    <div className="exp-modal" onClick={e => e.stopPropagation()}>
                        <h3>Add to Experience</h3>
                        <button className="exp-modal-btn" onClick={() => { setShowButton(false); setShowOld(true); }}>Existing Experience</button>
                        <button className="exp-modal-btn" onClick={() => { setShowButton(false); setShowNew(true); }}>New Experience</button>
                        <button className="exp-modal-close" onClick={() => { setShowButton(false); productIdRef.current = null; }}>Cancel</button>
                    </div>
                </div>
            )}

            {showNew && (
                <Suspense fallback={null}>
                    <AddExperience
                        onClose={() => { setShowNew(false); setShowButton(true); }}
                        onSuccess={() => { setShowNew(false); setShowButton(false); productIdRef.current = null; fetchProducts(page); }}
                        preselectedProduct={productIdRef.current}
                    />
                </Suspense>
            )}
            {showOld && (
                <div className="exp-modal-overlay" onClick={() => { setShowOld(false); setShowButton(true); }}>
                    <div className="exp-modal" onClick={e => e.stopPropagation()}>
                        <h3>Select Experience</h3>
                        <select className="exp-modal-select" value={selectedExp} onChange={e => setSelectedExp(e.target.value)}>
                            <option>Select an experience</option>
                            {Experience.length === 0
                                ? <option>No Experience Found</option>
                                : Experience.map((mem) => (
                                    <option key={mem._id} value={mem.expid?._id}>{mem.expid?.expname}</option>
                                ))
                            }
                        </select>
                        <button className="exp-modal-btn" onClick={addProductInExp}>Confirm</button>
                        <button className="exp-modal-close" onClick={() => { setShowOld(false); setShowButton(true); setSelectedExp(""); }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Products;
