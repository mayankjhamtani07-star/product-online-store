const mongoose = require("mongoose");
const replySchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["user", "admin"], required: true },
    message: { type: String, required: true },
}, { timestamps: true });
const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [String], // Array of filenames
    status: { type: String, enum: ["Open", "In Progress", "Closed"], default: "Open" },
    closedAt: { type: Date }, // Track resolution date
    replies: [replySchema]
}, { timestamps: true });
module.exports = mongoose.model("Ticket", ticketSchema);
