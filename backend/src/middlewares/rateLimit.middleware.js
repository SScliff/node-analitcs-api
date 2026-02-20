/**
 * Custom Rate Limit Middleware (Study Prototype)
 */

const logger = require('../services/monitoring/logger.service');
const { security } = require('../config');

const requestCounts = new Map();
const { windowMs, limit } = security.rateLimit;

module.exports = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, firstRequest: now });
        return next();
    }

    const { count, firstRequest } = requestCounts.get(ip);

    if (now - firstRequest > windowMs) {
        // Reset window
        requestCounts.set(ip, { count: 1, firstRequest: now });
        return next();
    }

    if (count >= limit) {
        logger.warn({ module: 'security', action: 'rate_limit_block', ip, count, limit }, 'Rate limit atingido');
        return res.status(429).json({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Try again later.'
        });
    }

    requestCounts.set(ip, { count: count + 1, firstRequest });
    next();
};
