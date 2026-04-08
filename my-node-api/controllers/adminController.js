const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const db = require("../services/db");

exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Incorrect Email Or Password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect Email Or Password" });
    if (user.role !== "admin") return res.status(403).json({ message: "Access denied" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7h" });
    res.status(200).json({ message: "Login Successful", token, user: { name: user.name, image: user.image } });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
    const Lead = require("../models/lead");
    const [totalUsers, totalProducts, totalExperiences, totalLeads, openTickets] = await Promise.all([
        db.countUsers(),
        db.countProducts({ status: "Active" }),
        db.countExperiences(),
        Lead.countDocuments(),
        db.countTickets({ status: "Open" })
    ]);
    res.status(200).json({ totalUsers, totalProducts, totalExperiences, totalLeads, openTickets });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { role: "user" };
    if (req.query.status) filter.status = req.query.status;
    const [users, total] = await Promise.all([
        db.findAllUsers(skip, limit, filter),
        db.countAllUsers(filter)
    ]);
    res.status(200).json({ data: users, total });
});

exports.deactivateUser = asyncHandler(async (req, res) => {
    const user = await db.setUserStatus(req.params.id, "Inactive");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deactivated successfully" });
});

exports.activateUser = asyncHandler(async (req, res) => {
    const user = await db.setUserStatus(req.params.id, "Active");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User activated successfully" });
});

exports.getAllProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
        filter.$or = [
            { name: { $regex: req.query.search, $options: "i" } },
            { details: { $regex: req.query.search, $options: "i" } }
        ];
    }
    const [products, total] = await Promise.all([
        db.findAllProducts(skip, limit, filter),
        db.countProducts(filter)
    ]);
    res.status(200).json({ data: products, total });
});

exports.filterAdminProducts = asyncHandler(async (req, res) => {
    const { categoryId, subcategoryId, search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;
    if (categoryId) filter.category = { $in: Array.isArray(categoryId) ? categoryId : [categoryId] };
    if (subcategoryId) filter.subcategory = { $in: Array.isArray(subcategoryId) ? subcategoryId : [subcategoryId] };
    if (search) filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } }
    ];
    const [products, total] = await Promise.all([
        db.findAllProducts(skip, limit, filter),
        db.countProducts(filter)
    ]);
    res.status(200).json({ data: products, total });
});

exports.deactivateProduct = asyncHandler(async (req, res) => {
    const product = await db.setProductStatus(req.params.id, "Inactive");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deactivated successfully" });
});

exports.activateProduct = asyncHandler(async (req, res) => {
    const product = await db.setProductStatus(req.params.id, "Active");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product activated successfully" });
});

exports.getAllExperiences = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [experiences, total] = await Promise.all([
        db.findAllExperiences(skip, limit, filter),
        db.countAllExperiences(filter)
    ]);
    const data = await Promise.all(experiences.map(async (exp) => {
        const members = await db.findMembersByExp(exp._id);
        return { ...exp.toObject(), memberCount: members.length, members };
    }));
    res.status(200).json({ data, total });
});

exports.getExperienceDetail = asyncHandler(async (req, res) => {
    const exp = await db.findExpByIdPopulated(req.params.id);
    if (!exp) return res.status(404).json({ message: "Experience not found" });
    const members = await db.findMembersByExp(req.params.id);
    res.status(200).json({ exp, members });
});

exports.deactivateExperience = asyncHandler(async (req, res) => {
    const exp = await db.setExpStatus(req.params.id, "Inactive");
    if (!exp) return res.status(404).json({ message: "Experience not found" });
    res.status(200).json({ message: "Experience deactivated successfully" });
});

exports.activateExperience = asyncHandler(async (req, res) => {
    const exp = await db.setExpStatus(req.params.id, "Active");
    if (!exp) return res.status(404).json({ message: "Experience not found" });
    res.status(200).json({ message: "Experience activated successfully" });
});

exports.createProduct = asyncHandler(async (req, res) => {
    const { name, details, price, category, subcategory } = req.body;
    const existing = await db.findProductByName(name);
    if (existing) return res.status(409).json({ message: "Product already exists" });
    const image = req.file ? req.file.filename : "";
    await db.createProduct({ name, image, details, price, category, subcategory });
    res.status(201).json({ message: "Product added successfully" });
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const { name, details, price, category, subcategory } = req.body;
    const update = { name, details, price, category, subcategory };
    if (req.file) update.image = req.file.filename;
    const product = await db.updateProductById(req.params.id, update);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated successfully", product });
});

exports.getAllLeads = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const Lead = require("../models/lead");
    const [leads, total] = await Promise.all([
        Lead.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Lead.countDocuments()
    ]);
    res.status(200).json({ data: leads, total });
});

exports.getAllTickets = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status && req.query.status !== "All") filter.status = req.query.status;
    const Ticket = require("../models/ticket");
    const [tickets, total] = await Promise.all([
        Ticket.find(filter).select("-replies").populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
        db.countTickets(filter)
    ]);
    res.status(200).json({ data: tickets, total });
});

exports.getTicketDetail = asyncHandler(async (req, res) => {
    const ticket = await db.findTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ ticket });
});

exports.updateTicketStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const update = { status };
    if (status === "Closed") {
        update.closedAt = new Date();
    } else {
        update.closedAt = null;
    }
    const ticket = await db.updateTicketById(req.params.id, update);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ message: "Ticket updated successfully", ticket });
});

exports.addReply = asyncHandler(async (req, res) => {
    const sendEmail = require("../utils/sendEmail");
    const { message } = req.body;
    const reply = { sender: req.user._id, senderRole: "admin", message };
    const ticket = await db.addReplyToTicket(req.params.id, reply);
    // notify user
    sendEmail(
        ticket.userId.email,
        `Reply on Your Ticket: ${ticket.subject}`,
        `<div style="font-family:sans-serif;padding:24px"><h2>New Reply on Your Ticket</h2><p>Support team replied to <strong>${ticket.subject}</strong>:</p><div style="background:#fff0ed;padding:16px;border-radius:8px;border-left:4px solid #f4785a"><p>${message}</p></div></div>`
    ).catch(console.error);
    res.status(200).json({ message: "Reply added successfully", ticket });
});

// ── Firebase Tickets ──
const { db: firestoreDb, admin: firebaseAdmin } = require("../config/firebaseAdmin");

exports.getAllTicketsFire = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let snapshot = await firestoreDb.collection("tickets").get();
    let all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (status && status !== "All") {
        all = all.filter(t => t.status === status);
    }

    all.sort((a, b) => {
        const aTime = a.createdAt?._seconds ?? new Date(a.createdAt).getTime() / 1000;
        const bTime = b.createdAt?._seconds ?? new Date(b.createdAt).getTime() / 1000;
        return bTime - aTime;
    });

    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit);

    res.status(200).json({ data, total });
});

exports.getTicketDetailFire = asyncHandler(async (req, res) => {
    const doc = await firestoreDb.collection("tickets").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ ticket: { id: doc.id, ...doc.data() } });
});

exports.updateTicketStatusFire = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const ticketRef = firestoreDb.collection("tickets").doc(req.params.id);
    const update = { status, closedAt: status === "Closed" ? new Date().toISOString() : null };
    await ticketRef.update(update);
    const updatedDoc = await ticketRef.get();
    res.status(200).json({ message: "Status updated", ticket: { id: updatedDoc.id, ...updatedDoc.data() } });
});

exports.addReplyFire = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const ticketRef = firestoreDb.collection("tickets").doc(req.params.id);
    const doc = await ticketRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Ticket not found" });
    const reply = {
        sender: req.user.id,
        senderName: "Support Team",
        senderRole: "admin",
        message,
        createdAt: new Date().toISOString()
    };
    await ticketRef.update({ replies: firebaseAdmin.firestore.FieldValue.arrayUnion(reply) });
    const updatedDoc = await ticketRef.get();
    res.status(200).json({ message: "Reply added", ticket: { id: updatedDoc.id, ...updatedDoc.data() } });
});