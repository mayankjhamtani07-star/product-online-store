const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { placeOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus, verifyPayment, createRazorpayOrder } = require("../controllers/orderController");

router.post("/", auth, placeOrder);
router.get("/", auth, getUserOrders);
router.get("/admin/all", adminAuth, getAllOrders);
router.put("/admin/:id/status", adminAuth, updateOrderStatus);
router.post("/create-payment", auth, createRazorpayOrder);
router.post("/verify-payment", auth, verifyPayment);
router.get("/:id", auth, getOrderById);
module.exports = router;
