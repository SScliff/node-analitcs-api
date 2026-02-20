/**
 * Advanced Rate Limit Middleware (Sliding Window & Whitelist)
 * 
 * Requirements:
 * 1. Trusted IP support (Whitelist) for testing/dev.
 * 2. Sliding Window algorithm to prevent "edge-of-window" bursts.
 * 3. Consistent logging for monitoring.
 * 4. Custom headers (RateLimit-Limit, RateLimit-Remaining).
 */

const logger = require('../services/monitoring/logger.service');
const { security } = require('../config');

// Using a Map to store arrays of timestamps [timestamp1, timestamp2, ...]
const ipHistory = new Map();

const { windowMs, limit } = security.rateLimit;
const { trustedIps } = security;

module.exports = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    // 1. Whitelist Check
    if (trustedIps.includes(ip)) {
        return next();
    }

    // 2. Init history for IP
    if (!ipHistory.has(ip)) {
        ipHistory.set(ip, []);
    }

    let timestamps = ipHistory.get(ip);

    // 3. Sliding Window Logic: Filter out timestamps outside the current window
    const windowStart = now - windowMs;
    timestamps = timestamps.filter(time => time > windowStart);

    // 4. Rate Limit Check
    if (timestamps.length >= limit) {
        logger.warn({
            module: 'security',
            action: 'rate_limit_block',
            ip,
            count: timestamps.length,
            limit
        }, 'Rate limit atingido (Sliding Window)');

        // RFC-compliant Headers
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000));

        return res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)}s.`,
            status: 429
        });
    }

    // 5. Success: Register hit and move on
    timestamps.push(now);
    ipHistory.set(ip, timestamps);

    // Add remaining info to headers for the client
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - timestamps.length);

    next();
};
