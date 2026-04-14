const asyncHandler = require("../utils/asyncHandler");
const Cart = require("../models/cart");
const db = require("../services/db");

exports.getCart = asyncHandler(async (req, res) => {
    const items = await Cart.find({ userid: req.user._id }).populate("productid");
    res.status(200).json({ data: items });
});

exports.addToCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await db.findProductById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existing = await Cart.findOne({ userid: req.user._id, productid: productId });
    if (existing) return res.status(409).json({ message: "Product already in cart" });

    const item = await Cart.create({ userid: req.user._id, productid: productId });
    res.status(201).json({ message: "Added to cart", item });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ _id: req.params.id, userid: req.user._id });
    res.status(200).json({ message: "Item removed from cart" });
});

exports.clearCart = asyncHandler(async (req, res) => {
    await Cart.deleteMany({ userid: req.user._id });
    res.status(200).json({ message: "Cart cleared" });
});
