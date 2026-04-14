import api from "./axios";

// ── Auth ──
export const loginUser = (data) => api.post("users/login", data);
export const registerUser = (data) => api.post("users/register", data);
export const forgotPassword = (email) => api.post("users/forgot-password", { email });
export const resetPassword = (token, password) => api.put(`users/reset-password/${token}`, { password });

// ── User ──
export const getMe = () => api.get("users/me");
export const updateMe = (formData) => api.put("users/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updatePassword = (data) => api.put("users/password", data);

// ── Products ──
export const getProducts = (page, limit) => api.get("products/", { params: { page, limit } });
export const getProductsWithWish = (page, limit) => api.get("products/wish", { params: { page, limit } });
export const searchProducts = (search, page, limit) => api.get("products/search", { params: { search, page, limit } });
export const filterProducts = (params) => api.get(`products/filter?${params}`);
export const createProduct = (formData) => api.post("products", formData, { headers: { "Content-Type": "multipart/form-data" } });

// ── Wishlist ──
export const getWishlist = () => api.get("wishlist");
export const toggleWish = (productId) => api.post(`wishlist/${productId}`, {});

// ── Categories ──
export const getCategories = () => api.get("categories/");
export const getSubcategories = (categoryId) => {
    const url = categoryId ? `categories/subcategory/${categoryId}` : "categories/subcategory";
    return api.get(url);
};
export const getSubcategoriesByIds = (params) => api.get(`categories/subcategory?${params}`);

// ── Experiences ──
export const getExperiences = (page, limit) => api.get("experiences", { params: { page, limit } });
export const getExperience = (expId) => api.get(`experiences/${expId}`);
export const getExistingExperiences = () => api.get("experiences/exist");
export const getArchivedExperiences = (page, limit) => api.get("experiences/archived", { params: { page, limit } });
export const createExperience = (formData) => api.post("experiences", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateExperience = (expId, formData) => api.put(`experiences/${expId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteExperience = (expId) => api.delete(`experiences/delete/${expId}`);
export const archiveExperience = (expId) => api.post(`experiences/archive/${expId}`, {});
export const unarchiveExperience = (expId) => api.post(`experiences/unarchive/${expId}`, {});
export const sendInviteEmail = (email, expid) => api.post("experiences/invite", { email, expid });
export const joinExperience = (code) => api.post("experiences/join", { code });
export const addProductToExperience = (productId, expid) => api.post("experiences/add-product", { productId, expid });
export const removeUserFromExperience = (memId, expid) => api.delete("experiences/removeuser", { data: { memId, expid } });

// ── Lead ──
export const subscribeLead = (email) => api.post("leads", { email });

// ── Cart ──
export const getCart = () => api.get("cart");
export const addToCart = (productId) => api.post(`cart/${productId}`);
export const removeFromCart = (id) => api.delete(`cart/${id}`);
export const clearCart = () => api.delete("cart/clear");

// ── Orders ──
export const placeOrder = () => api.post("orders");
export const getOrders = () => api.get("orders");
export const getOrderById = (id) => api.get(`orders/${id}`);


// ── Ticket ──
export const getTickets = (status) => api.get("tickets", { params: { ...(status && { status }) } });
export const getTicketById = (id) => api.get(`tickets/${id}`);
export const createTicket = (data) => api.post("tickets", data, { headers: { "Content-Type": "multipart/form-data" } });
export const replyToTicket = (id, message) => api.post(`tickets/${id}/reply`, { message });
export const reopenTicket = (id) => api.put(`tickets/${id}/reopen`);

// ── Ticket Firebase ──
export const getTicketsFire = (status) => api.get("tickets-fire", { params: { ...(status && { status }) } });
export const getTicketByIdFire = (id) => api.get(`tickets-fire/${id}`);
export const createTicketFire = (data) => api.post("tickets-fire", data, { headers: { "Content-Type": "multipart/form-data" } });
export const replyToTicketFire = (id, message) => api.post(`tickets-fire/${id}/reply`, { message });
export const reopenTicketFire = (id) => api.put(`tickets-fire/${id}/reopen`);

// ── Payment ──
export const createPayment = (total) => api.post("orders/create-payment", { total });
export const verifyPayment = (data) => api.post("orders/verify-payment", data);