const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "FarmerProduct", required: true },
                quantity: { type: Number, required: true },
                selectedVariety: { type: String, required: false }
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema)