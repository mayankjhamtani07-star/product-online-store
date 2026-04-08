const asyncHandler = require("../utils/asyncHandler");
const db = require("../services/db");

exports.createProducts = asyncHandler(async (req, res) => {
    const { name, details, price, category, subcategory } = req.body;
    const existing = await db.findProductByName(name);
    if (existing) return res.status(409).json({ message: "Product already exist" });
    const image = req.file ? req.file.filename : "";
    await db.createProduct({ name, image, details, price, category, subcategory });
    res.status(201).json({ message: "Product Added Successful" });
});

exports.getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { status: "Active" };
    const total = await db.countProducts(filter);
    const products = await db.findProducts(filter, skip, limit);
    if (!products.length) return res.status(404).json({ message: "No products found" });
    res.status(200).json({ data: products, total });
});

exports.getProductsBySearch = asyncHandler(async (req, res) => {
    const search = req.query.search?.trim();
    if (!search) return res.status(400).json({ message: "Search value required" });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {
        status: "Active",
        $or: [
            { name: { $regex: search, $options: "i" } },
            { details: { $regex: search, $options: "i" } }
        ]
    };
    const total = await db.countProducts(filter);
    const products = await db.findProductsRaw(filter, skip, limit);
    if (!products.length) return res.status(404).json({ message: "No products found", products: [] });
    res.status(200).json({ data: products, total });
});

exports.getProductsWithWish = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const filter = { status: "Active" };
    const total = await db.countProducts(filter);
    const products = await db.findProducts(filter, skip, limit);
    if (!products.length) return res.status(404).json({ message: "No products found" });
    const wishList = await db.findWishIdsByUser(req.user._id);
    const wishedIds = new Set(wishList.map(w => w.productid.toString()));
    const result = products.map(p => ({ ...p.toObject(), wishlisted: wishedIds.has(p._id.toString()) }));
    res.status(200).json({ data: result, total });
});

exports.getProductsByFilter = asyncHandler(async (req, res) => {
    const { categoryId, subcategoryId } = req.query;
    if (!categoryId && !subcategoryId) return res.status(400).json({ message: "At least one filter is required" });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { status: "Active" };
    if (categoryId) filter.category = { $in: Array.isArray(categoryId) ? categoryId : [categoryId] };
    if (subcategoryId) filter.subcategory = { $in: Array.isArray(subcategoryId) ? subcategoryId : [subcategoryId] };
    const total = await db.countProducts(filter);
    const products = await db.findProducts(filter, skip, limit);
    if (!products.length) return res.status(404).json({ message: "No products found" });
    res.status(200).json({ data: products, total });
});
