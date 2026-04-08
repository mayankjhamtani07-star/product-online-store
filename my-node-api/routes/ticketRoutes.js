const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { ticketUpload } = require("../middleware/upload");
const {
    createTicket,
    getUserTickets,
    getTicketById,
    updateTicketStatus,
    addReply,
    reopenTicket,
    getAllTickets
} = require("../controllers/ticketController");
const adminAuth = require("../middleware/adminAuth");

router.post("/", auth, ticketUpload.array("attachments", 7), createTicket);
router.get("/", auth, getUserTickets);
router.get("/admin/all", adminAuth, getAllTickets);
router.get("/:id", auth, getTicketById);
router.put("/:id/status", auth, updateTicketStatus);
router.post("/:id/reply", auth, addReply);
router.put("/:id/reopen", auth, reopenTicket);

module.exports = router;
