const asyncHandler = require("../utils/asyncHandler");
const db = require("../services/db");

exports.lead = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const exists = await db.findLeadByEmail(email);
    if (exists) return res.status(409).json({ message: "Already subscribed" });
    await db.createLead(email);
    res.status(201).json({ message: "Thank you for subscribing!" });
});
