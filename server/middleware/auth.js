// server/middleware/auth.js
// JWT authentication middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the JWT token from the Authorization header.
 * Attaches the user object to req.user if valid.
 */
async function auth(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user and check if still active
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account has been disabled.' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        return res.status(500).json({ message: 'Server error during authentication.' });
    }
}

module.exports = auth;
