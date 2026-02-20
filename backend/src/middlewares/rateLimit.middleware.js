/**
 * Custom Rate Limit Middleware (Study Prototype)
 * 
 * Objectives:
 * 1. Tracking requests per IP.
 * 2. Defining windows (e.g., 1 minute).
 * 3. Handling headers (X-RateLimit-Limit, X-RateLimit-Remaining).
 */

const logger = require('../services/logger.service');

const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const LIMIT = 100;

module.exports = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, firstRequest: now });
        return next();
    }

    const { count, firstRequest } = requestCounts.get(ip);

    if (now - firstRequest > WINDOW_MS) {
        // Reset window
        requestCounts.set(ip, { count: 1, firstRequest: now });
        return next();
    }

    if (count >= LIMIT) {
        logger.warn({ module: 'security', action: 'rate_limit_block', ip, count, limit: LIMIT }, 'Rate limit atingido');
        return res.status(429).json({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Try again later.'
        });
    }

    requestCounts.set(ip, { count: count + 1, firstRequest });
    next();
};
