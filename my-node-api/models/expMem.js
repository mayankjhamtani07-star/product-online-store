const mongoose = require("mongoose");

const expMemSchema = new mongoose.Schema({

    role: {
        type: String,
        enum: ["admin", "member"],
        default: "member"
    },
    expid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Experience",
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    invitedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    invitedsource: {
        type: String,
        enum: ["code", "email", null],
        default: "code"
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending"
    },
    isArchieved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
module.exports = mongoose.model("ExperienceMember", expMemSchema)