const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Razorpay = require("razorpay");

// ── User ──
exports.placeOrder = asyncHandler(async (req, res) => {
    const cartItems = await Cart.find({ userid: req.user._id }).populate("productid");
    if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" });

    const items = cartItems.map(item => ({
        productid: item.productid._id,
        name: item.productid.name,
        price: item.productid.price,
        image: item.productid.image
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price, 0);
    const shipping = 5.99;
    const total = subtotal + shipping;

    const order = await Order.create({ userid: req.user._id, items, subtotal, shipping, total });

    // clear cart after order placed
    await Cart.deleteMany({ userid: req.user._id });

    res.status(201).json({ message: "Order placed successfully", order });
});

exports.getUserOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userid: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ data: orders });
});

exports.getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, userid: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ order });
});
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
    const { total } = req.body;
    console.log("[createRazorpayOrder] body:", req.body, "| key_id present:", !!process.env.RAZORPAY_KEY_ID, "| key_secret present:", !!process.env.RAZORPAY_KEY_SECRET);
    if (!total) return res.status(400).json({ message: "Total is required" });
    const amountPaise = Math.round(total * 100);
    console.log("[createRazorpayOrder] amount in paise:", amountPaise);
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const razorpayOrder = await instance.orders.create({ amount: amountPaise, currency: "INR", receipt: `receipt_${Date.now()}` });
    console.log("[createRazorpayOrder] Razorpay order:", razorpayOrder);
    res.status(200).json({ order: razorpayOrder });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log("[verifyPayment] received:", { razorpay_order_id, razorpay_payment_id, razorpay_signature: razorpay_signature?.slice(0, 10) + "..." });
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
    console.log("[verifyPayment] signature match:", generatedSignature === razorpay_signature);

    if (generatedSignature !== razorpay_signature)
        return res.status(400).json({ message: "Invalid payment signature" });

    // payment verified — NOW create the order and clear cart
    const cartItems = await Cart.find({ userid: req.user._id }).populate("productid");
    if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" });

    const items = cartItems.map(item => ({
        productid: item.productid._id,
        name: item.productid.name,
        price: item.productid.price,
        image: item.productid.image
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price, 0);
    const shipping = 5.99;
    const total = subtotal + shipping;

    const order = await Order.create({
        userid: req.user._id,
        items,
        subtotal,
        shipping,
        total,
        isPaid: true,
        paymentId: razorpay_payment_id,
        status: "Processing"
    });

    await Cart.deleteMany({ userid: req.user._id });

    res.status(201).json({ message: "Payment verified and order placed", order });
});
// ── Admin ──
exports.getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
        Order.find(filter).populate("userid", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter)
    ]);
    res.status(200).json({ data: orders, total });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate("userid", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order status updated", order });
});
