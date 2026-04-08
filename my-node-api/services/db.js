const User = require("../models/user");
const Product = require("../models/product");
const Wish = require("../models/wishlist");
const Exp = require("../models/exp");
const ExpMem = require("../models/expMem");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const Lead = require("../models/lead");
const Ticket = require("../models/ticket");

// ── User ──
exports.findUserByEmail = (email) => User.findOne({ email });
exports.findUserById = (id) => User.findById(id);
exports.findUserByIdNoPass = (id) => User.findById(id).select("-password");
exports.createUser = (data) => User.create(data);
exports.updateUserById = (id, data) => User.findByIdAndUpdate(id, data, { new: true }).select("-password");
exports.findUserByResetToken = (hashedToken) => User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });

// ── Product ──
exports.findProductByName = (name) => Product.findOne({ name });
exports.findProductById = (id) => Product.findById(id);
exports.createProduct = (data) => Product.create(data);
exports.countProducts = (filter) => Product.countDocuments(filter);
exports.findProducts = (filter, skip, limit) => Product.find(filter).populate("category").populate("subcategory").skip(skip).limit(limit);
exports.findProductsRaw = (filter, skip, limit) => Product.find(filter).skip(skip).limit(limit);

// ── Wishlist ──
exports.findWish = (userid, productid) => Wish.findOne({ userid, productid });
exports.findWishById = (id) => Wish.findByIdAndDelete(id);
exports.createWish = (userid, productid) => Wish.create({ userid, productid });
exports.findWishByUser = (userid) => Wish.find({ userid }).populate("productid");
exports.findWishIdsByUser = (userid) => Wish.find({ userid });

// ── Experience ──
exports.findExpByName = (expname) => Exp.findOne({ expname });
exports.findExpById = (id) => Exp.findById(id);
exports.findExpByIdPopulated = (id) => Exp.findById(id).populate("productIds");
exports.createExp = (data) => Exp.create(data);
exports.findExpByCode = (code) => Exp.findOne({ code });

// ── ExpMem ──
exports.findMember = (expid, userid) => ExpMem.findOne({ expid, userid });
exports.findMembersByExp = (expid) => ExpMem.find({ expid }).populate("userid", "name email");
exports.countMembersByExp = (expid) => ExpMem.countDocuments({ expid });
exports.findMembersByUser = (userid, isArchived) => ExpMem.find({ userid, isArchieved: isArchived }).populate({ path: "expid", match: { status: "Active" }, populate: { path: "productIds" } });
exports.findAdminMembersByUser = (userid) => ExpMem.find({ userid, role: "admin" }).populate({ path: "expid", match: { status: "Active" } });
exports.createMember = (data) => ExpMem.create(data);
exports.deleteMemberById = (id) => ExpMem.findByIdAndDelete(id);

// ── Category ──
exports.findCategoryByName = (name) => Category.findOne({ name });
exports.findCategoryById = (id) => Category.findById(id);
exports.createCategory = (name) => Category.create({ name });
exports.findCategories = () => Category.find({ status: "Active" });

// ── SubCategory ──
exports.findSubCategoryByName = (name, categoryId) => SubCategory.findOne({ name, category: categoryId });
exports.createSubCategory = (name, categoryId) => SubCategory.create({ name, category: categoryId });
exports.findSubCategories = (filter) => SubCategory.find(filter);

// ── Lead ──
exports.findLeadByEmail = (email) => Lead.findOne({ email });
exports.createLead = (email) => Lead.create({ email });

// ── Admin Stats ──
exports.countUsers = () => User.countDocuments({ role: "user" });
exports.countExperiences = () => Exp.countDocuments({ status: "Active" });

// ── Admin Queries ──
exports.findAllUsers = (skip, limit, filter = {}) => User.find({ role: "user", ...filter }).select("-password").skip(skip).limit(limit);
exports.countAllUsers = (filter = {}) => User.countDocuments({ role: "user", ...filter });
exports.findAllProducts = (skip, limit, filter = {}) => Product.find(filter).populate("category").populate("subcategory").skip(skip).limit(limit);
exports.findAllExperiences = (skip, limit, filter = {}) => Exp.find(filter).skip(skip).limit(limit);
exports.countAllExperiences = (filter = {}) => Exp.countDocuments(filter);
exports.setUserStatus = (id, status) => User.findByIdAndUpdate(id, { status }, { new: true });
exports.setProductStatus = (id, status) => Product.findByIdAndUpdate(id, { status }, { new: true });
exports.updateProductById = (id, data) => Product.findByIdAndUpdate(id, data, { new: true });
exports.setExpStatus = (id, status) => Exp.findByIdAndUpdate(id, { status }, { new: true });

// ── Ticket ──
exports.createTicket = (data) => Ticket.create(data);
exports.findTicketById = (id) => Ticket.findById(id).populate("userId", "name email").populate("replies.sender", "name image");
exports.findTickets = (filter) => Ticket.find(filter).populate("userId", "name email").sort({ createdAt: -1 });
exports.countTickets = (filter) => Ticket.countDocuments(filter);
exports.updateTicketById = (id, data) => Ticket.findByIdAndUpdate(id, data, { new: true }).populate("userId", "name email");
exports.addReplyToTicket = (id, reply) => Ticket.findByIdAndUpdate(id, { $push: { replies: reply } }, { new: true }).populate("userId", "name email").populate("replies.sender", "name image");
