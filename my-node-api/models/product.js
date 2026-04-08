"use strict";
const mongoose = require("mongoose");

const productSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    details:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
}, { timestamps: true });

module.exports = mongoose.model("Products", productSchema)