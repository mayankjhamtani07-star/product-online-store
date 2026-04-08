require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Category = require("./models/category");
const SubCategory = require("./models/subCategory");

const data = {
    Electronics: ["Mobile", "Laptop", "TV", "Camera", "Headphones"],
    Clothing:    ["Jeans", "Shirt", "T-Shirt", "Jacket", "Dress", "Watch", "Shoes"],
    Food:        ["Fruits", "Vegetables", "Dairy", "Snacks", "Beverages"],
    Books:       ["Fiction", "Non-Fiction", "Science", "History", "Comics"],
    Other:       ["Miscellaneous"]
};

const seed = async () => {
    await connectDB();

    for (const [categoryName, subcategories] of Object.entries(data)) {
        let category = await Category.findOne({ name: categoryName });
        if (!category) category = await Category.create({ name: categoryName });

        for (const subName of subcategories) {
            const exists = await SubCategory.findOne({ name: subName, category: category._id });
            if (!exists) await SubCategory.create({ name: subName, category: category._id });
        }

        console.log(`✔ ${categoryName} seeded`);
    }

    console.log("Seeding complete");
    process.exit();
};

seed();
