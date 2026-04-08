const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createUpload } = require("../middleware/upload");
const upload = createUpload("products");
const {createProducts, getProducts, getProductsBySearch, getProductsByFilter, getProductsWithWish} = require("../controllers/productControlers");

router.get("/", getProducts);
router.get("/search", getProductsBySearch);
router.get("/filter", getProductsByFilter);
router.get("/wish", auth, getProductsWithWish);

module.exports = router;