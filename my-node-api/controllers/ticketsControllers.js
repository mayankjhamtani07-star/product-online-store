const asyncHandler = require("../utils/asyncHandler");
const { db, admin } = require("../config/firebaseAdmin");
const sendEmail = require("../utils/sendEmail");

const adminEmail = process.env.EMAIL;

// --- Email Templates (Reusing from original controller for consistency) ---
const ticketCreatedHtml = (name, subject, description) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#1a1a2e">Ticket Raised Successfully (Firebase)</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your support ticket has been raised. Our team will get back to you shortly.</p>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0 0 8px"><strong>Subject:</strong> ${subject}</p>
        <p style="margin:0"><strong>Description:</strong> ${description}</p>
    </div>
</div>`;

exports.createTicketFire = asyncHandler(async (req, res) => {
    const { subject, description } = req.body;
    if (!subject || !description) return res.status(400).json({ message: "All fields are required" });
    
    const attachments = req.files ? req.files.map(file => file.filename) : [];
    
    const ticketData = {
        userId: req.user._id.toString(),
        userName: req.user.name,
        userEmail: req.user.email,
        subject,
        description,
        status: "Open",
        attachments,
        replies: [], // Store as array for simplicity, matching your Mongo model
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        closedAt: null
    };

    const docRef = await db.collection("tickets").add(ticketData);
    
    // Notify
    sendEmail(req.user.email, `Ticket Raised: ${subject}`, ticketCreatedHtml(req.user.name, subject, description)).catch(console.error);

    res.status(201).json({ 
        message: "Ticket created successfully in Firebase", 
        ticket: { id: docRef.id, ...ticketData } 
    });
});

exports.getUserTicketsFire = asyncHandler(async (req, res) => {
    const snapshot = await db.collection("tickets")
        .where("userId", "==", req.user._id.toString())
        .get();

    let tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (req.query.status === "Open") {
        tickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress");
    } else if (req.query.status === "Closed") {
        tickets = tickets.filter(t => t.status === "Closed");
    }

    tickets.sort((a, b) => {
        const aTime = a.createdAt?._seconds ?? new Date(a.createdAt).getTime() / 1000;
        const bTime = b.createdAt?._seconds ?? new Date(b.createdAt).getTime() / 1000;
        return bTime - aTime;
    });

    res.status(200).json({ data: tickets });
});

exports.getTicketByIdFire = asyncHandler(async (req, res) => {
    const doc = await db.collection("tickets").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Ticket not found" });
    
    const ticket = { id: doc.id, ...doc.data() };
    
    if (ticket.userId !== req.user._id.toString())
        return res.status(403).json({ message: "Access denied" });

    res.status(200).json({ ticket });
});

exports.addReplyFire = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticketRef = db.collection("tickets").doc(req.params.id);
    const doc = await ticketRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Ticket not found" });

    const ticket = doc.data();

    const reply = {
        sender: req.user._id.toString(),
        senderName: req.user.name,
        senderRole: req.user.role,
        message,
        createdAt: new Date().toISOString()
    };

    await ticketRef.update({
        replies: admin.firestore.FieldValue.arrayUnion(reply)
    });

    // send push notification to the other party
    const User = require("../models/user");
    if (req.user.role === "admin") {
        const user = await User.findById(ticket.userId);
        if (user?.fcmToken) {
            admin.messaging().send({
                token: user.fcmToken,
                data: { title: `Reply on: ${ticket.subject}`, body: message }
            }).catch(console.error);
        }
    } else {
        const adminUser = await User.findOne({ role: "admin" });
        if (adminUser?.fcmToken) {
            admin.messaging().send({
                token: adminUser.fcmToken,
                data: { title: `User replied: ${ticket.subject}`, body: `${req.user.name}: ${message}` }
            }).catch(console.error);
        }
    }

    const updatedDoc = await ticketRef.get();
    res.status(200).json({ 
        message: "Reply added to Firebase", 
        ticket: { id: updatedDoc.id, ...updatedDoc.data() } 
    });
});

exports.reopenTicketFire = asyncHandler(async (req, res) => {
    const ticketRef = db.collection("tickets").doc(req.params.id);
    const doc = await ticketRef.get();
    if (!doc.exists) return res.status(404).json({ message: "Ticket not found" });

    if (doc.data().userId !== req.user._id.toString())
        return res.status(403).json({ message: "Unauthorized" });

    await ticketRef.update({ status: "Open", closedAt: null });
    
    const updatedDoc = await ticketRef.get();
    res.status(200).json({ 
        message: "Ticket reopened in Firebase", 
        ticket: { id: updatedDoc.id, ...updatedDoc.data() } 
    });
});

exports.updateTicketStatusFire = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const ticketRef = db.collection("tickets").doc(req.params.id);
    
    const update = { status, closedAt: status === "Closed" ? new Date().toISOString() : null };
    await ticketRef.update(update);

    const updatedDoc = await ticketRef.get();
    res.status(200).json({ message: "Status updated", ticket: { id: updatedDoc.id, ...updatedDoc.data() } });
});