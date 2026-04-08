const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { ticketUpload } = require("../middleware/upload");
const {
    createTicketFire,
    getUserTicketsFire,
    getTicketByIdFire,
    addReplyFire,
    reopenTicketFire,
    updateTicketStatusFire
} = require("../controllers/ticketsControllers");

router.post("/", auth, ticketUpload.array("attachments", 7), createTicketFire);
router.get("/", auth, getUserTicketsFire);
router.get("/:id", auth, getTicketByIdFire);
router.post("/:id/reply", auth, addReplyFire);
router.put("/:id/reopen", auth, reopenTicketFire);
router.put("/:id/status", auth, updateTicketStatusFire);

module.exports = router;
