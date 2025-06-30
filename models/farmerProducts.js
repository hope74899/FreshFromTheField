const mongoose = require("mongoose");

const farmerProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        category: { type: String, required: true },
        price: { type: Number, required: true }, // price per unit
        unit: { type: String }, // e.g., kg, dozen, bundle

        quantity: { type: Number, required: true }, // current stock

        minOrderQty: { type: Number, default: 1 },
        maxOrderQty: { type: Number, default: 100 },

        varieties: [{ type: String }],

        images: [
            {
                key: String,
                filename: String,
            },
        ],

        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        approved: { type: Boolean, default: false },
        availability: { type: Boolean, default: true },
        bestProduct: { type: Boolean, default: false },
    },
    { timestamps: true }
);

farmerProductSchema.pre("save", function (next) {
    if (this.quantity === 0) {
        this.availability = false;
    }
    next();
});

const FarmerProduct = mongoose.model("FarmerProduct", farmerProductSchema);
module.exports = FarmerProduct;
