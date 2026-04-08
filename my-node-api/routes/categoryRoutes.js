const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createCategory, createSubCategory, getCategories, getSubCategories } = require("../controllers/categoryController");

router.post("/", auth, createCategory);
router.post("/subcategory", auth, createSubCategory);
router.get("/", getCategories);
router.get("/subcategory", getSubCategories);
router.get("/subcategory/:categoryId", getSubCategories);

module.exports = router;
