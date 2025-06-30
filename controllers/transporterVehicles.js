const Vehicle = require("../models/transporterVehicles")
const User = require("../models/users");
const deleteFile = require("../config/deleteFile");

const createVehicle = async (req, res) => {
    try {
        const { id } = req.params; // Transporter ID
        const { vehicleType, vehicleCapacity, registrationNumber } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Transporter ID is required" });
        }

        if (!vehicleType || !vehicleCapacity || !registrationNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if transporter already has 5 or more vehicles
        const existingVehicleCount = await Vehicle.countDocuments({ transporter: id });
        if (existingVehicleCount >= 5) {
            return res.status(403).json({
                message: "❌ Vehicle limit reached. You can only add up to 5 vehicles.",
            });
        }

        const images = Object.keys(req.files || {})
            .map((key) => ({
                key,
                filename: req.files[key][0]?.filename,
            }))
            .filter((img) => img.filename);

        const vehicleData = {
            vehicleType,
            vehicleCapacity,
            registrationNumber,
            images,
            transporter: id,
        };

        const newVehicle = await Vehicle.create(vehicleData);

        res.status(201).json({
            message: "✅ Vehicle created successfully",
            vehicle: newVehicle,
        });
    } catch (error) {
        console.error("Error creating vehicle:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// const getAllVehicles = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, vehicleType, city, searchTerm, sortBy } = req.query;

//         const pageNumber = parseInt(page);
//         const limitNumber = parseInt(limit);

//         const filter = { approved: true }; // Only show approved vehicles

//         if (vehicleType && vehicleType !== "all") {
//             filter.vehicleType = vehicleType;
//         }
//         if (searchTerm) {
//             filter.vehicleType = { $regex: searchTerm, $options: "i" }; // Case-insensitive search
//         }

//         let sort = {};
//         if (sortBy === "capacity_asc") {
//             sort = { vehicleCapacity: 1 }; // Sort by capacity ascending
//         } else if (sortBy === "capacity_desc") {
//             sort = { vehicleCapacity: -1 }; // Sort by capacity descending
//         }

//         const totalVehicles = await Vehicle.countDocuments(filter);

//         const skip = (pageNumber - 1) * limitNumber;
//         // console.log('filter', filter)
//         const vehicles = await Vehicle.find(filter)
//             .populate(
//                 "transporter",
//                 "_id profileImage firstName lastName role isVerified profileComplete address.city"
//             )
//             .limit(limitNumber)
//             .skip(skip)
//             .sort(sort);


//         // console.log('vehicles', vehicles)
//         // Filter by city from populated transporter's address
//         let filteredVehicles = vehicles;
//         if (city && city !== "all") {
//             filteredVehicles = vehicles.filter(
//                 (vehicle) => vehicle.transporter?.address?.city === city
//             );
//         }

//         res.status(200).json({
//             message: "All vehicles fetched successfully",
//             total: totalVehicles,
//             page: Number(page),
//             totalPages: Math.ceil(totalVehicles / limitNumber),
//             vehicles: filteredVehicles,
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

const getAllVehicles = async (req, res) => {
    try {
        const { page = 1, limit = 10, vehicleType, city, searchTerm, sortBy } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Build the aggregation pipeline
        const pipeline = [];

        // Match approved vehicles
        pipeline.push({
            $match: { approved: true },
        });

        // Lookup to join with users collection
        pipeline.push({
            $lookup: {
                from: 'users', // Matches Mongoose's collection name for User model
                localField: 'transporter',
                foreignField: '_id',
                as: 'transporter',
            },
        });

        // Unwind the transporter array (ensure transporter exists)
        pipeline.push({
            $unwind: '$transporter',
        });

        // Build filter conditions
        const matchConditions = {};

        if (vehicleType && vehicleType !== 'all') {
            matchConditions.vehicleType = vehicleType;
        }
        if (city && city !== 'all') {
            matchConditions['transporter.city'] = { $regex: `^${city}$`, $options: 'i' }; // Case-insensitive exact match
        }
        if (searchTerm) {
            matchConditions.vehicleType = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
        }

        // Add match stage for additional filters
        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({
                $match: matchConditions,
            });
        }

        // Sorting
        let sort = {};
        if (sortBy === 'capacity_asc') {
            sort = { vehicleCapacity: 1 };
        } else if (sortBy === 'capacity_desc') {
            sort = { vehicleCapacity: -1 };
        }
        if (Object.keys(sort).length > 0) {
            pipeline.push({
                $sort: sort,
            });
        }

        // Facet for pagination and total count
        pipeline.push({
            $facet: {
                metadata: [
                    { $count: 'total' },
                    {
                        $addFields: {
                            page: Number(page),
                            totalPages: { $ceil: { $divide: ['$total', limitNumber] } },
                        },
                    },
                ],
                data: [
                    { $skip: (pageNumber - 1) * limitNumber },
                    { $limit: limitNumber },
                    {
                        $set: {
                            transporter: {
                                _id: '$transporter._id',
                                profileImage: '$transporter.profileImage',
                                firstName: '$transporter.firstName',
                                lastName: '$transporter.lastName',
                                role: '$transporter.role',
                                isVerified: '$transporter.isVerified',
                                profileComplete: '$transporter.profileComplete',
                                city: '$transporter.city', // Corrected from address.city
                            },
                        },
                    },
                ],
            },
        });

        // Execute the aggregation
        const result = await Vehicle.aggregate(pipeline);

        // Extract metadata and data
        const totalVehicles = result[0].metadata[0]?.total || 0;
        const vehicles = result[0].data || [];

        res.status(200).json({
            message: 'All vehicles fetched successfully',
            total: totalVehicles,
            page: Number(page),
            totalPages: Math.ceil(totalVehicles / limitNumber),
            vehicles,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getPendingVehicles = async (req, res) => {
    try {
        const filter = { approved: false };
        const unapprovedVehicles = await Vehicle.find(filter).populate(
            "transporter",
            "_id profileImage firstName lastName role isVerified profileComplete address.city"
        );

        res.status(200).json({
            message: "Unapproved vehicles fetched successfully",
            vehicles: unapprovedVehicles,
        });
    } catch (error) {
        console.error("Error fetching unapproved vehicles:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const vehicle = await Vehicle.findById(id).populate(
            "transporter",
            "_id profileImage firstName lastName email role address city country province"
        );

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.status(200).json({
            message: "Vehicle fetched successfully",
            vehicle,
        });
    } catch (error) {
        console.error("Error fetching vehicle by ID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const userData = req.user;
        console.log("userData", userData);
        const { id } = req.params;
        const existingVehicle = await Vehicle.findById(id);

        if (!existingVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        const updateData = { ...req.body };
        delete updateData.approved; // Prevent updating the approved field

        if (req.files) {
            let updatedImages = [...existingVehicle.images];

            for (const key in req.files) {
                const fileArray = req.files[key];
                const filename = fileArray[0]?.filename;

                if (!filename) {
                    continue;
                }

                const existingImageIndex = updatedImages.findIndex(
                    (img) => img.key === key
                );

                if (existingImageIndex !== -1) {
                    updatedImages[existingImageIndex].filename = filename;
                } else {
                    updatedImages.push({ key: key, filename: filename });
                }
            }

            updateData.images = updatedImages;
        }

        console.log("updateData", updateData);

        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        res.status(200).json({
            message: "Vehicle updated successfully",
            vehicle: updatedVehicle,
        });
    } catch (error) {
        console.error("Error updating vehicle:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteVehicle = async (req, res) => {
    const { id } = req.params;

    try {
        const vehicleToDelete = await Vehicle.findById(id);

        if (!vehicleToDelete) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        const filenamesToDelete =
            vehicleToDelete.images?.map((img) => img.filename).filter(Boolean) || [];

        const deletionResult = await Vehicle.findByIdAndDelete(id);

        if (!deletionResult) {
            return res
                .status(500)
                .json({ message: "Database deletion failed unexpectedly." });
        }

        filenamesToDelete.forEach((filename) => {
            console.log("Attempting to delete associated image files...", filename);
            deleteFile(filename);
        });

        res
            .status(200)
            .json({ message: "Vehicle and associated images deleted successfully" });
    } catch (error) {
        console.error(`Server error during vehicle deletion for ID: ${id}:`, error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getVehiclesByUserId = async (req, res) => {
    try {
        const { transporterId } = req.params;
        console.log("Received ID:", transporterId);

        const transporter = await User.findById(transporterId).select(
            "_id profileImage firstName lastName email role address city country province"
        );

        if (!transporter) {
            return res.status(404).json({ message: "Invalid Transporter Id" });
        }

        const vehicles = await Vehicle.find({ transporter: transporterId }).populate(
            "transporter",
            "_id profileImage firstName lastName email role address city country province"
        );

        res.status(200).json({
            message: "Transporter's vehicles fetched successfully",
            transporter,
            vehicles,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getVehiclesDetails = async (req, res) => {
    try {
        const { transporterId } = req.params;
        console.log("Received ID:", transporterId);

        const transporter = await User.findById(transporterId);
        if (!transporter) {
            return res.status(404).json({ message: "Invalid Transporter Id" });
        }

        const vehicles = await Vehicle.find({ transporter: transporterId });
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentVehicles = vehicles.filter((v) => {
            const date = v.updatedAt || v.createdAt;
            return date && new Date(date) >= sevenDaysAgo;
        });

        const vehiclesDetails = {
            TotalCount: vehicles.filter((v) => v.availability).length,
            approvedCount: vehicles.filter((v) => v.approved).length,
            bestVehicleCount: vehicles.filter((v) => v.bestVehicle).length,
            latestCount: vehicles.length,
            recentVehicles,
        };

        console.log(vehiclesDetails);
        res.status(200).json({
            message: "Transporter's vehicles details fetched successfully",
            vehiclesDetails,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteVehicleImage = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { imageKey } = req.body;

        console.log(
            `--- Starting deleteVehicleImage for vehicle: ${vehicleId}, imageKey: ${imageKey} ---`
        );

        if (!imageKey) {
            console.log("Error: Image key is missing in the request body.");
            return res.status(400).json({ message: "Image key is required." });
        }

        console.log(`Step 1: Finding vehicle with ID: ${vehicleId}`);
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            console.log(`Error: Vehicle not found for ID: ${vehicleId}`);
            return res.status(404).json({ message: "Vehicle not found" });
        }
        console.log("Step 1: Vehicle found.");

        const imageToDelete = vehicle.images.find((img) => img.key === imageKey);
        if (!imageToDelete) {
            console.warn(
                `Warning: Image with key ${imageKey} not found for deletion in vehicle ${vehicleId}. Might be already deleted.`
            );
            return res.status(200).json({
                message: "Image not found or already deleted.",
                vehicle: vehicle,
            });
        }
        console.log(
            `Found image to delete with key ${imageKey} and filename ${imageToDelete.filename}`
        );

        const filenameToDelete = imageToDelete.filename;

        console.log("Step 2: Filtering out the image to be deleted.");
        let remainingImages = vehicle.images.filter((img) => img.key !== imageKey);

        console.log("Step 3: Re-keying the remaining images sequentially.");
        const rekeyedImages = remainingImages.map((img, index) => {
            const newKey = `image${index + 1}`;
            console.log(`Mapping index ${index} to new key ${newKey} for filename ${img.filename}`);
            return {
                _id: img._id,
                filename: img.filename,
                key: newKey,
            };
        });

        console.log(
            "Step 3 Result: Intended re-keyed images array for DB update:",
            JSON.stringify(rekeyedImages, null, 2)
        );

        const updateOperation = { $set: { images: rekeyedImages } };
        console.log(`Step 4: Attempting DB update for vehicleId: ${vehicleId}`);
        console.log(
            "Step 4: Update operation object:",
            JSON.stringify(updateOperation, null, 2)
        );

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            updateOperation,
            { new: true }
        );

        if (!updatedVehicle) {
            console.error(
                `Error: findByIdAndUpdate did not return an updated vehicle for ID: ${vehicleId}.`
            );
            return res.status(404).json({
                message: "Vehicle not found during final update attempt, or update failed.",
            });
        }
        console.log("Step 4: DB update successful.");

        console.log(
            "Step 4 Result: Updated vehicle object returned from DB:",
            JSON.stringify(updatedVehicle, null, 2)
        );

        console.log(`Step 5: Attempting to delete physical file: ${filenameToDelete}`);
        deleteFile(filenameToDelete);

        console.log(
            `--- Finishing deleteVehicleImage for vehicle: ${vehicleId} successfully ---`
        );

        res.status(200).json({
            message: `Image (${filenameToDelete || imageKey}) deleted and remaining images re-keyed.`,
            vehicle: updatedVehicle,
        });
    } catch (error) {
        console.error(
            `--- ERROR in deleteVehicleImage for vehicle: ${req.params.vehicleId}, imageKey: ${req.body?.imageKey} ---`
        );
        console.error("Full error object:", error);
        res.status(500).json({
            message: "Server error during image deletion/re-keying.",
            error: error.message,
        });
    }
};

const getLatestVehicles = async (req, res) => {
    try {
        const filter = { approved: true };

        const vehicles = await Vehicle.find(filter)
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(7) // Only 7 latest
            .populate(
                "transporter",
                "_id profileImage firstName lastName role isVerified profileComplete address.city"
            );

        res.status(200).json({
            message: "Latest vehicles fetched successfully",
            vehicles,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getTransportersBestVehicles = async (req, res) => {
    try {
        const filter = { bestVehicle: true };
        const vehicles = await Vehicle.find(filter)
            .limit(7)
            .populate(
                "transporter",
                "_id profileImage firstName lastName role isVerified profileComplete address.city"
            );

        res.status(200).json({
            message: "Best vehicles fetched successfully",
            vehicles,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createVehicle,
    getAllVehicles,
    getPendingVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    getVehiclesByUserId,
    getVehiclesDetails,
    deleteVehicleImage,
    getLatestVehicles,
    getTransportersBestVehicles,
};