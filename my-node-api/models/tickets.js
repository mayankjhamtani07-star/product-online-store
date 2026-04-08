const express = require("express");
const router = express.Router();

const {
    createTicket,
    getTickets,
    getTicketDetails,
    addReply
} = require("../controllers/ticketsControllers");

router.post("/create", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketDetails);
router.post("/:ticketId/reply", addReply);

module.exports = router;