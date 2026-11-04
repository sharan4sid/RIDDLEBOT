// server/middleware/aiRateLimiter.js
// Rate limiter to prevent API abuse, excessive token consumption, and DDoS

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 AI requests per minute per user/IP

const requestCounts = new Map();

// Periodic cleanup every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
        if (now - record.startTime > WINDOW_MS * 2) {
            requestCounts.delete(key);
        }
    }
}, 5 * 60 * 1000);

function aiRateLimiter(req, res, next) {
    const identifier = req.user ? req.user._id.toString() : (req.ip || 'anonymous');
    const now = Date.now();

    const record = requestCounts.get(identifier);

    if (!record) {
        requestCounts.set(identifier, {
            count: 1,
            startTime: now
        });
        return next();
    }

    if (now - record.startTime > WINDOW_MS) {
        // Reset window
        record.count = 1;
        record.startTime = now;
        return next();
    }

    record.count += 1;

    if (record.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
            message: 'Too many AI requests. Please slow down and try again in a minute.',
            retryAfterSeconds: Math.ceil((record.startTime + WINDOW_MS - now) / 1000)
        });
    }

    next();
}

module.exports = aiRateLimiter;
