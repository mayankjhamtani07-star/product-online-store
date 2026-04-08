const asyncHandler = require("../utils/asyncHandler");
const db = require("../services/db");

exports.createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const exists = await db.findCategoryByName(name);
    if (exists) return res.status(409).json({ message: "Category already exists" });
    const category = await db.createCategory(name);
    res.status(201).json({ message: "Category created successfully", category });
});

exports.createSubCategory = asyncHandler(async (req, res) => {
    const { name, categoryId } = req.body;
    const category = await db.findCategoryById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const exists = await db.findSubCategoryByName(name, categoryId);
    if (exists) return res.status(409).json({ message: "SubCategory already exists" });
    const subCategory = await db.createSubCategory(name, categoryId);
    res.status(201).json({ message: "SubCategory created successfully", subCategory });
});

exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await db.findCategories();
    res.status(200).json(categories);
});

exports.getSubCategories = asyncHandler(async (req, res) => {
    const categoryId = req.params.categoryId || req.query.categoryId;
    const filter = { status: "Active" };
    if (categoryId) {
        const ids = Array.isArray(categoryId) ? categoryId : [categoryId];
        filter.category = { $in: ids };
    }
    const subCategories = await db.findSubCategories(filter);
    if (!subCategories.length) return res.status(404).json({ message: "No subcategories found" });
    res.status(200).json(subCategories);
});
