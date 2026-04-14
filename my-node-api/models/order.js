const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productid: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String }
});

const orderSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 5.99 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    paymentId: { type: String, default: null },
    isPaid: { type: Boolean, default: false },
    
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
