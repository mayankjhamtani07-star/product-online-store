import api from "./axios";

// ── Auth ──
export const loginAdmin = (data) => api.post("login", data);

// ── Dashboard ──
export const getDashboardStats = () => api.get("stats");

// ── Users ──
export const getAllUsers = (page, limit, status) => api.get("users", { params: { page, limit, ...(status && { status }) } });
export const deactivateUser = (id) => api.put(`users/${id}/deactivate`);
export const activateUser = (id) => api.put(`users/${id}/activate`);

// ── Products ──
export const getAllProducts = (page, limit, search, status) => api.get("products", { params: { page, limit, ...(search && { search }), ...(status && { status }) } });
export const filterAdminProducts = (params) => api.get(`products/filter?${params}`);
export const createProduct = (formData) => api.post("products", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateProduct = (id, formData) => api.put(`products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deactivateProduct = (id) => api.put(`products/${id}/deactivate`);
export const activateProduct = (id) => api.put(`products/${id}/activate`);

// ── Experiences ──
export const getAllExperiences = (page, limit, status) => api.get("experiences", { params: { page, limit, ...(status && { status }) } });
export const getExperienceDetail = (id) => api.get(`experiences/${id}`);
export const deactivateExperience = (id) => api.put(`experiences/${id}/deactivate`);
export const activateExperience = (id) => api.put(`experiences/${id}/activate`);

// ── Leads ──
export const getAllLeads = (page, limit) => api.get("leads", { params: { page, limit } });

// ── Tickets ──
export const getAdminTickets = (page, limit, status) => api.get("tickets", { params: { page, limit, ...(status && status !== "All" && { status }) } });
export const getAdminTicketById = (id) => api.get(`tickets/${id}`);
export const adminReplyTicket = (id, message) => api.post(`tickets/${id}/reply`, { message });
export const adminUpdateTicketStatus = (id, status) => api.put(`tickets/${id}/status`, { status });

// ── Tickets Firebase ──
export const getAdminTicketsFire = (page, limit, status) => api.get("tickets-fire", { params: { page, limit, ...(status && status !== "All" && { status }) } });
export const getAdminTicketByIdFire = (id) => api.get(`tickets-fire/${id}`);
export const adminReplyTicketFire = (id, message) => api.post(`tickets-fire/${id}/reply`, { message });
export const adminUpdateTicketStatusFire = (id, status) => api.put(`tickets-fire/${id}/status`, { status });
