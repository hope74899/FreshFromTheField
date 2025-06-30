// Remove the require for express-async-handler
// const asyncHandler = require('express-async-handler');
const User = require('../models/users');             // Adjusted path based on your code
const FarmerProduct = require('../models/farmerProducts'); // Adjusted path based on your code
// const Order = require('../models/Order'); // Uncomment if fetching order stats

// @desc    Get Admin Dashboard Statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => { // Added 'next' parameter
    try {
        // --- User Statistics ---
        // Using Promise.all remains efficient
        const totalUsersPromise = User.countDocuments({});
        const userRolesPromise = User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $project: { _id: 0, role: '$_id', count: 1 } }
        ]);

        // --- Product Statistics ---
        const totalProductsPromise = FarmerProduct.countDocuments({});
        const approvedProductsPromise = FarmerProduct.countDocuments({ approved: true });
        const pendingProductsPromise = FarmerProduct.countDocuments({ approved: false });

        // --- Execute all promises concurrently ---
        const [
            totalUsers,
            userRoles,
            totalProducts,
            approvedProducts,
            pendingProducts,
        ] = await Promise.all([
            totalUsersPromise,
            userRolesPromise,
            totalProductsPromise,
            approvedProductsPromise,
            pendingProductsPromise,
        ]);

        // --- Format User Roles ---
        const userStats = userRoles.reduce((acc, roleCount) => {
            acc[roleCount.role] = roleCount.count;
            return acc;
        }, {});

        // --- Combine into final stats object ---
        const stats = {
            totalUsers: totalUsers || 0,
            adminUsers: userStats.admin || 0,
            farmerUsers: userStats.farmer || 0,
            transporterUsers: userStats.transporter || 0,
            buyerUsers: userStats.buyer || 0, // Adjust role names as needed

            totalProducts: totalProducts || 0,
            approvedProducts: approvedProducts || 0,
            pendingProducts: pendingProducts || 0,
            // Add other stats if needed
        };

        res.status(200).json({ stats }); // Send response structured as { stats: {...} }

    } catch (error) {
        // Catch any error from the async operations or processing
        console.error("Error fetching dashboard stats:", error);
        // Pass the error to the next middleware (your error handler)
        next(error);
        // You could optionally send a generic response here too, but
        // letting the error handler middleware manage it is generally preferred.
        // res.status(500).json({ message: "Failed to retrieve dashboard statistics" });
    }
};


// @desc    Get Recent Products for Admin Dashboard
// @route   GET /api/admin/products/recent?limit=5
// @access  Private/Admin
const getRecentProducts = async (req, res, next) => { // Added 'next' parameter
    // Validate and parse limit outside the try block for clarity
    const limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
        // Handle invalid limit parameter early
        return res.status(400).json({ message: "Invalid limit parameter specified." });
        // Or pass an error:
        // const err = new Error("Invalid limit parameter specified.");
        // err.status = 400;
        // return next(err);
    }
    const finalLimit = limit || 5; // Use default if parsing results in NaN/0, though check above helps

    try {
        const recentProducts = await FarmerProduct.find({})
            .sort({ createdAt: -1 })
            .limit(finalLimit)
            .populate('farmer', 'firstName lastName farmName email')
            .select('name price unit approved createdAt farmer');

        // Map to format for frontend
        const formattedProducts = recentProducts.map(product => {
             const farmerName = product.farmer
                ? `${product.farmer.firstName || ''} ${product.farmer.lastName || ''}`.trim() || product.farmer.farmName || 'N/A'
                : 'N/A';

            return {
                 _id: product._id,
                 name: product.name,
                 price: product.price,
                 unit: product.unit,
                 status: product.approved ? 'Approved' : 'Pending',
                 date: product.createdAt,
                 farmerName: farmerName
            };
        });

        res.status(200).json({ products: formattedProducts }); // Send structured as { products: [...] }

    } catch (error) {
        // Catch any error from the async operations or processing
        console.error("Error fetching recent products:", error);
        // Pass the error to the next middleware (your error handler)
        next(error);
        // Optionally send response:
        // res.status(500).json({ message: "Failed to retrieve recent products" });
    }
};


module.exports = {
    getDashboardStats,
    getRecentProducts,
};