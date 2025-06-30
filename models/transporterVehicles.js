const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
    {
        vehicleType: {
            type: String,
            required: true, // e.g., Truck, Van, Bike
        },
        vehicleCapacity: {
            type: Number,
            required: true,
            min: [0, "Capacity cannot be negative"], // Capacity in KG
        },
        registrationNumber: {
            type: String,
            required: true,
            unique: true, // Unique vehicle registration number
        },
        images: [
            {
                key: String,
                filename: String,
            },
        ],
        transporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        approved: {
            type: Boolean,
            default: false, // Admin approval required
        },
        availability: {
            type: Boolean,
            default: true, // Vehicle available by default
        },
        bestVehicle: {
            type: Boolean,
            default: false, // Added for best vehicles
        },
    },
    { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;