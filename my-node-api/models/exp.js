const mongoose = require("mongoose");

const expSchema = new mongoose.Schema({
    expname: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    productIds: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products"
            }
        ],
        default: []
    },
    image: {
        type: String,
        default: ""
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
}, { timestamps: true });
module.exports = mongoose.model("Experience", expSchema)