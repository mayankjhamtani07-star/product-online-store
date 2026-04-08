const asyncHandler = require("../utils/asyncHandler");
const db = require("../services/db");

exports.createWish = asyncHandler(async (req, res) => {
    const pid = req.params.productId;
    if (!pid) return res.status(400).json({ message: "Product id is required" });
    const product = await db.findProductById(pid);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const existing = await db.findWish(req.user._id, pid);
    if (existing) {
        await db.findWishById(existing._id);
        return res.status(201).json({ message: "Product Removed From Wishlist" });
    }
    await db.createWish(req.user._id, pid);
    res.status(201).json({ message: "Product added to Wishlist" });
});

exports.getWish = asyncHandler(async (req, res) => {
    const wishlist = await db.findWishByUser(req.user._id);
    res.status(200).json(wishlist);
});
