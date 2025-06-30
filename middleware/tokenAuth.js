const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const token = req.header("Authorization");
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ message: 'Unauthorized: Invalid Authorization header' });
        }

        // Remove "Bearer" prefix and trim
        const jwttoken = token.replace("Bearer", "").trim();

        // Verify token
        const decoded = jwt.verify(jwttoken, process.env.PRIVATE_SECRET_KEY);
        // Fetch user from database
        const userData = await User.findById(decoded.userId);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach user to the request object
        req.user = userData;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token has expired' });
        }
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
