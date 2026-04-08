const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")

const { createWish, getWish } = require("../controllers/wishControlers")

router.post("/:productId", auth, createWish);
router.get("/", auth, getWish);



module.exports = router;