import { useState, useEffect } from "react";
import { FiPackage, FiFileText, FiDollarSign, FiImage, FiX, FiGrid, FiList } from "react-icons/fi";
import useCategories from "../hooks/useCategories";
import './components.css';

// createFn / updateFn are passed as props so this works for both admin and user
const AddProduct = ({ onClose, onSuccess, createFn, updateFn, product }) => {
    const isEdit = !!product;
    const [form, setForm] = useState({ name: "", details: "", price: "", category: "", subcategory: "" });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const { categories, subcategories, fetchCategories, fetchSubcategories } = useCategories();

    useEffect(() => {
        if (isEdit) {
            fetchCategories();
            setForm({
                name: product.name || "",
                details: product.details || "",
                price: product.price || "",
                category: product.category?._id || product.category || "",
                subcategory: product.subcategory?._id || product.subcategory || "",
            });
            if (product.category?._id || product.category) {
                fetchSubcategories(product.category?._id || product.category);
            }
            if (product.image) setPreview(`http://localhost:3001/uploads/${product.image}`);
        }
    }, []); // eslint-disable-line

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.category) return alert("Please select a category");
        if (!form.subcategory) return alert("Please select a subcategory");
        if (!isEdit && !image) return alert("Please upload a product image");
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("details", form.details);
        formData.append("price", form.price);
        formData.append("category", form.category);
        formData.append("subcategory", form.subcategory);
        if (image) formData.append("image", image);
        try {
            if (isEdit) await updateFn(product._id, formData);
            else await createFn(formData);
            handleClose();
            onSuccess();
        } catch (err) {
            alert(err?.response?.data?.message || "Something went wrong.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleClose = () => {
        onClose();
        setForm({ name: "", details: "", price: "", category: "", subcategory: "" });
        setImage(null);
        setPreview(null);
    };

    return (
        <div className="form-overlay">
            <div className="form-modal">
                <button className="form-close" onClick={handleClose}><FiX size={18} /></button>
                <div className="form-modal__header">
                    <h3 className="form-title">{isEdit ? "Edit Product" : "Add New Product"}</h3>
                    <p className="form-subtitle">{isEdit ? "Update product details" : "Fill in the details to list a new product"}</p>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-upload-area" onClick={() => document.getElementById('imgInput').click()}>
                        {preview ? (
                            <img src={preview} alt="preview" className="form-upload-preview" />
                        ) : (
                            <div className="form-upload-placeholder">
                                <FiImage size={32} color="#F4785A" />
                                <span>Click to upload product image</span>
                                <small>PNG, JPG up to 5MB</small>
                            </div>
                        )}
                        <input id="imgInput" type="file" accept="image/*" onChange={handleImageChange} className="input-hidden" />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Product Name</label>
                        <div className="form-input-wrapper">
                            <FiPackage className="form-icon" />
                            <input className="form-input" type="text" placeholder="e.g. Classic White Tee" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="form-label">Product Details</label>
                        <div className="form-input-wrapper">
                            <FiFileText className="form-icon form-icon--top" />
                            <textarea className="form-input form-textarea" placeholder="Describe the product..." value={form.details}
                                onChange={(e) => setForm({ ...form, details: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="form-label">Price</label>
                        <div className="form-input-wrapper">
                            <FiDollarSign className="form-icon" />
                            <input className="form-input" type="number" placeholder="0.00" value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="form-label">Category</label>
                        <div className="form-input-wrapper">
                            <FiGrid className="form-icon" />
                            <select className="form-input" value={form.category}
                                onFocus={() => { if (!categories.length) fetchCategories(); }}
                                onChange={(e) => { setForm({ ...form, category: e.target.value, subcategory: "" }); fetchSubcategories(e.target.value); }} required>
                                <option value="" disabled>Select a Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="form-label">Sub Category</label>
                        <div className="form-input-wrapper">
                            <FiList className="form-icon" />
                            <select className="form-input" value={form.subcategory}
                                onChange={(e) => setForm({ ...form, subcategory: e.target.value })} required>
                                <option value="" disabled>Select a Sub Category</option>
                                {subcategories.map(sub => (
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="form-submit">{isEdit ? "Update Product" : "Add Product"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
