const adminMiddleware = async (req, res, next) => {
    try {
        // Check if req.user exists and has isAdmin property
        if (!req.user || req.user.role !== 'admin') {
            console.log("Unauthorized access attempt to admin route.");
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        // User is an admin, proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error in adminMiddleware:", error);
        res.status(500).json({ message: "An error occurred in the admin middleware." });
    }
};

module.exports = adminMiddleware;
