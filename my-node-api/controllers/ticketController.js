const asyncHandler = require("../utils/asyncHandler");
const db = require("../services/db");
const sendEmail = require("../utils/sendEmail");
const { getIO } = require("../config/socketInstance");

const adminEmail = process.env.EMAIL;

const ticketCreatedHtml = (name, subject, description) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#1a1a2e">Ticket Raised Successfully</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your support ticket has been raised. Our team will get back to you shortly.</p>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0 0 8px"><strong>Subject:</strong> ${subject}</p>
        <p style="margin:0"><strong>Description:</strong> ${description}</p>
    </div>
    <p style="color:#888;font-size:13px">You will receive an email when our team replies.</p>
</div>`;

const replyToUserHtml = (name, subject, message) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#1a1a2e">New Reply on Your Ticket</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Support team has replied to your ticket: <strong>${subject}</strong></p>
    <div style="background:#fff0ed;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #f4785a">
        <p style="margin:0">${message}</p>
    </div>
    <p style="color:#888;font-size:13px">Login to your account to view the full conversation and reply.</p>
</div>`;

const replyToAdminHtml = (userName, subject, message) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#1a1a2e">User Replied on Ticket</h2>
    <p><strong>${userName}</strong> has replied to ticket: <strong>${subject}</strong></p>
    <div style="background:#f4f6fb;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #7b7fe8">
        <p style="margin:0">${message}</p>
    </div>
</div>`;

const newTicketAdminHtml = (userName, userEmail, subject, description) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#1a1a2e">New Support Ticket Raised</h2>
    <p><strong>${userName}</strong> (${userEmail}) has raised a new ticket.</p>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0 0 8px"><strong>Subject:</strong> ${subject}</p>
        <p style="margin:0"><strong>Description:</strong> ${description}</p>
    </div>
</div>`;

exports.createTicket = asyncHandler(async (req, res) => {
    const { subject, description } = req.body;
    if (!subject || !description) return res.status(400).json({ message: "All fields are required" });
    const attachments = req.files ? req.files.map(file => file.filename) : [];
    const ticket = await db.createTicket({ subject, description, userId: req.user._id, attachments });

    // email to user
    sendEmail(req.user.email, `Ticket Raised: ${subject}`, ticketCreatedHtml(req.user.name, subject, description)).catch(console.error);
    // email to admin
    sendEmail(adminEmail, `New Ticket: ${subject}`, newTicketAdminHtml(req.user.name, req.user.email, subject, description)).catch(console.error);

    res.status(201).json({ message: "Ticket created successfully", ticket });
});

exports.getUserTickets = asyncHandler(async (req, res) => {
    const Ticket = require("../models/ticket");
    const filter = { userId: req.user._id };

    if (req.query.status === "Open") {
        filter.status = { $in: ["Open", "In Progress"] };
    } else if (req.query.status === "Closed") {
        filter.status = "Closed";
    }

    const tickets = await Ticket.find(filter).select("-replies").sort({ createdAt: -1 });
    res.status(200).json({ data: tickets });
});

exports.getTicketById = asyncHandler(async (req, res) => {
    const ticket = await db.findTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.userId._id.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Access denied" });
    res.status(200).json({ ticket });
});

exports.updateTicketStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const update = { status, closedAt: status === "Closed" ? new Date() : null };
    const ticket = await db.updateTicketById(req.params.id, update);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    getIO().to(req.params.id).emit("ticket_status_changed", { status });
    res.status(200).json({ message: "Ticket status updated successfully", ticket });
});

exports.addReply = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const ticket = await db.findTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    const reply = { sender: req.user._id, senderRole: req.user.role, message };
    const updated = await db.addReplyToTicket(req.params.id, reply);

    getIO().to(req.params.id).emit("new_reply", {
        sender: req.user._id,
        senderRole: req.user.role,
        senderName: req.user.name,
        message,
        createdAt: new Date()
    });
    // if user replied → notify admin; if admin replied → notify user
    if (req.user.role === "user") {
        sendEmail(adminEmail, `User Reply: ${ticket.subject}`, replyToAdminHtml(req.user.name, ticket.subject, message)).catch(console.error);
    } else {
        sendEmail(ticket.userId.email, `Reply on Your Ticket: ${ticket.subject}`, replyToUserHtml(ticket.userId.name, ticket.subject, message)).catch(console.error);
    }
    res.status(200).json({ message: "Reply added successfully", ticket: updated });
});

exports.reopenTicket = asyncHandler(async (req, res) => {
    const ticket = await db.findTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.userId._id.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "You are not authorized to reopen this ticket" });
    if (ticket.status === "Open")
        return res.status(400).json({ message: "Ticket is already open" });
    await db.updateTicketById(req.params.id, { status: "Open", closedAt: null });
    const updatedTicket = await db.findTicketById(req.params.id);
    getIO().to(req.params.id).emit("ticket_status_changed", { status: "Open" });
    res.status(200).json({ message: "Ticket reopened successfully", ticket: updatedTicket });
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
        Ticket.countDocuments(filter)
    ]);
    res.status(200).json({ data: tickets, total });
});
