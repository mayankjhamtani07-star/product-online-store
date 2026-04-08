const express = require("express");
const router = express.Router();
const {lead} = require("../controllers/leadControllers")

router.post("/", lead);

module.exports = router;
