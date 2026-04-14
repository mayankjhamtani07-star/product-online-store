const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
