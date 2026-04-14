const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getCart, addToCart, removeFromCart, clearCart } = require("../controllers/cartController");

router.get("/", auth, getCart);
router.post("/:productId", auth, addToCart);
router.delete("/clear", auth, clearCart);
router.delete("/:id", auth, removeFromCart);

module.exports = router;
