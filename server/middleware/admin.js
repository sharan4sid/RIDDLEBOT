// server/middleware/admin.js
// Admin role verification middleware — must be used AFTER auth middleware

function admin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
}

module.exports = admin;
