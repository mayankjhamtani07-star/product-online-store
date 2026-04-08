import { useEffect, useState, Suspense, lazy, useRef } from "react";
import { getAllProducts, activateProduct, deactivateProduct, createProduct, updateProduct, filterAdminProducts } from "../api/services";
import { getCategories, getSubcategoriesByIds, getSubcategories } from "../../api/services";
import Toggle from "../components/Toggle";
import "./pages.css";

const AddProduct = lazy(() => import("../../components/addProduct"));
const LIMIT = 10;

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(() => Number(sessionStorage.getItem("admin_prod_page")) || 1);
    const [search, setSearch] = useState(() => sessionStorage.getItem("admin_prod_search") || "");
    const [status, setStatus] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(() => JSON.parse(sessionStorage.getItem("admin_prod_cat") || "[]"));
    const [selectedSubcategory, setSelectedSubcategory] = useState(() => JSON.parse(sessionStorage.getItem("admin_prod_subcat") || "[]"));
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [catOpen, setCatOpen] = useState(false);
    const [subCatOpen, setSubCatOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const timer = useRef(null);
    const filterRef = useRef(null);
    const filterApplied = useRef(false);
    const productsRef = useRef([]);

    useEffect(() => {
        productsRef.current = products;
    }, [products]);

    // close dropdowns on outside click
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

    const fetchProducts = (p, s, st, cats, subs, showLoading = true) => {
        if (showLoading) setLoading(true);
        const hasCatFilter = cats.length > 0 || subs.length > 0;
        if (hasCatFilter) {
            const params = new URLSearchParams();
            cats.forEach(id => params.append("categoryId", id));
            subs.forEach(id => params.append("subcategoryId", id));
            params.append("page", p);
            params.append("limit", LIMIT);
            if (s.trim()) params.append("search", s);
            if (st) params.append("status", st);
            filterAdminProducts(params)
                .then(res => { setProducts(res.data.data); setTotal(res.data.total); })
                .catch(() => { setProducts([]); setTotal(0); })
                .finally(() => { if (showLoading) setLoading(false); });
        } else {
            getAllProducts(p, LIMIT, s, st)
                .then(res => { setProducts(res.data.data); setTotal(res.data.total); })
                .catch(() => { setProducts([]); setTotal(0); })
                .finally(() => { if (showLoading) setLoading(false); });
        }
    };

    useEffect(() => {
        sessionStorage.setItem("admin_prod_page", page);
        sessionStorage.setItem("admin_prod_search", search);
        sessionStorage.setItem("admin_prod_cat", JSON.stringify(selectedCategory));
        sessionStorage.setItem("admin_prod_subcat", JSON.stringify(selectedSubcategory));
        clearTimeout(timer.current);
        timer.current = setTimeout(() => fetchProducts(page, search, status, selectedCategory, selectedSubcategory), 300);
        return () => clearTimeout(timer.current);
    }, [page, search, status, selectedCategory, selectedSubcategory]); // eslint-disable-line

    // load categories on mount
    useEffect(() => {
        getCategories().then(res => setCategories(res.data));
    }, []);

    // load subcategories when catOpen or selectedCategory changes
    useEffect(() => {
        if (!subCatOpen) return;
        if (selectedCategory.length === 0) {
            getSubcategories().then(res => setSubcategories(res.data));
        } else {
            const params = new URLSearchParams();
            selectedCategory.forEach(id => params.append("categoryId", id));
            getSubcategoriesByIds(params).then(res => setSubcategories(res.data));
        }
    }, [subCatOpen, selectedCategory]); // eslint-disable-line

    const toggle = async (p) => {
        setProducts(prev => prev.map(x => x._id === p._id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x));
        try {
            p.status === "Active" ? await deactivateProduct(p._id) : await activateProduct(p._id);
            if (status) {
                filterApplied.current = false;
                setTimeout(() => {
                    if (filterApplied.current) return;
                    filterApplied.current = true;
                    const prev = productsRef.current;
                    const filtered = prev.filter(x => x.status === status);
                    const removed = prev.length - filtered.length;
                    
                    const newTotal = total - removed;
                    if (removed > 0) setTotal(t => t - removed);

                    if (total > LIMIT && newTotal <= LIMIT && newTotal > 0) {
                        if (page !== 1) {
                            setPage(1);
                        } else {
                            fetchProducts(1, search, status, selectedCategory, selectedSubcategory, false);
                        }
                    } else if (filtered.length <= 5 && newTotal > filtered.length) {
                        if (page > 1 && newTotal <= (page - 1) * LIMIT) {
                            setPage(pg => pg - 1);
                        } else {
                            fetchProducts(page, search, status, selectedCategory, selectedSubcategory, false);
                        }
                    } else if (filtered.length === 0 && page > 1) {
                        setPage(pg => pg - 1);
                    }

                    setProducts(filtered);
                }, 1200);
            }
        } catch {
            setProducts(prev => prev.map(x => x._id === p._id ? { ...x, status: p.status } : x));
        }
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h2 className="admin-page-title">Products <span className="admin-page-count">{total} total</span></h2>
                <button className="admin-add-btn" onClick={() => { setEditProduct(null); setShowForm(true); }}>+ Add Product</button>
            </div>

            <div className="admin-search-filter" ref={filterRef}>
                <input className="admin-search" type="text" placeholder="Search products..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    onFocus={() => { setCatOpen(false); setSubCatOpen(false); }} />

                {/* Status pills */}
                <div className="admin-filters" style={{ margin: 0 }}>
                    {[["", "All"], ["Active", "Active"], ["Inactive", "Inactive"]].map(([val, lbl]) => (
                        <button key={val} className={`admin-filter-btn ${status === val ? "admin-filter-btn--active" : ""}`}
                            onClick={() => { setStatus(val); setPage(1); }}>{lbl}</button>
                    ))}
                </div>

                {/* Category dropdown */}
                <div className="admin-filter-group">
                    <div className={`admin-filter-label ${catOpen ? "open" : ""}`}
                        onClick={() => { setCatOpen(p => !p); setSubCatOpen(false); }}>
                        Categories {selectedCategory.length > 0 && `(${selectedCategory.length})`}
                        {selectedCategory.length > 0
                            ? <span onClick={e => { e.stopPropagation(); setSelectedCategory([]); setSelectedSubcategory([]); }} className="admin-filter-clear">×</span>
                            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                    </div>
                    {catOpen && (
                        <div className="admin-filter-dropdown">
                            {categories.map(cat => (
                                <label key={cat._id} className="admin-filter-checkbox">
                                    <input type="checkbox" checked={selectedCategory.includes(cat._id)}
                                        onChange={e => setSelectedCategory(prev =>
                                            e.target.checked ? [...prev, cat._id] : prev.filter(id => id !== cat._id)
                                        )} />
                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subcategory dropdown */}
                <div className="admin-filter-group">
                    <div className={`admin-filter-label ${subCatOpen ? "open" : ""}`}
                        onClick={() => { setSubCatOpen(p => !p); setCatOpen(false); }}>
                        Subcategories {selectedSubcategory.length > 0 && `(${selectedSubcategory.length})`}
                        {selectedSubcategory.length > 0
                            ? <span onClick={e => { e.stopPropagation(); setSelectedSubcategory([]); }} className="admin-filter-clear">×</span>
                            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                    </div>
                    {subCatOpen && (
                        <div className="admin-filter-dropdown">
                            {subcategories.map(sub => (
                                <label key={sub._id} className="admin-filter-checkbox">
                                    <input type="checkbox" checked={selectedSubcategory.includes(sub._id)}
                                        onChange={e => setSelectedSubcategory(prev =>
                                            e.target.checked ? [...prev, sub._id] : prev.filter(id => id !== sub._id)
                                        )} />
                                    {sub.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading ? <div className="admin-loading">Loading...</div> : (
                <>
                    <div className="admin-cards">
                        {products.map((p, i) => (
                            <div key={p._id} className="admin-card">
                                <div className="admin-card__left">
                                    <span className="admin-card__num">{(page - 1) * LIMIT + i + 1}</span>
                                    <img src={`http://localhost:3001/uploads/${p.image}`} alt={p.name} className="admin-card__img" />
                                    <div className="admin-card__info">
                                        <strong>{p.name}</strong>
                                        <span className="admin-card__details">{p.details}</span>
                                    </div>
                                </div>
                                <div className="admin-card__meta">
                                    <div className="admin-card__field"><label>Price</label><span>₹{p.price}</span></div>
                                    <div className="admin-card__field"><label>Category</label><span>{p.category?.name}</span></div>
                                    <div className="admin-card__field"><label>Subcategory</label><span>{p.subcategory?.name}</span></div>
                                </div>
                                <div className="admin-card__actions">
                                    <button className="admin-edit-btn" onClick={() => { setEditProduct(p); setShowForm(true); }}>Edit</button>
                                    <Toggle active={p.status === "Active"} onToggle={() => toggle(p)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>
                            ))}
                            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                        </div>
                    )}
                </>
            )}
            {showForm && (
                <Suspense fallback={null}>
                    <AddProduct
                        onClose={() => { setShowForm(false); setEditProduct(null); }}
                        onSuccess={() => fetchProducts(page, search, status, selectedCategory, selectedSubcategory)}
                        createFn={createProduct}
                        updateFn={updateProduct}
                        product={editProduct}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default ManageProducts;
