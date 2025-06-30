const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "FarmerProduct", required: true },
                productName: { type: String, required: true }, // snapshot in case product is deleted
                unit: { type: String }, // e.g., kg, dozen
                priceAtOrderTime: { type: Number, required: true },
                quantity: { type: Number, required: true },
                selectedVariety: { type: String, required: false }
            },
        ],

        deliveryInstructions: { type: String },
        totalAmount: { type: Number },
        contactInfo: { type: String }, // buyer’s contact method
        address: {
            street: { type: String },
            city: { type: String },
            province: { type: String },
        },
        status: {
            type: String,
            enum: ["Pending", "Accepted", "Delivered", "Cancelled"],
            default: "Pending",
        },

        cancelledBy: { type: String, enum: ["buyer", "farmer", null], default: null },
        cancellationReason: { type: String, default: null },

        placedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema)