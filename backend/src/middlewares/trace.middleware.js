const crypto = require('node:crypto');
const storage = require('../utils/storage');

/**
 * Trace ID Middleware
 * 
 * 1. Captures or generates a unique Trace ID (Correlation ID).
 * 2. Sets the ID in the response headers.
 * 3. Wraps the request in a storage context for propagation.
 */
const traceMiddleware = (req, res, next) => {
    // Generate UUID or use existing one from headers (for distributed tracing)
    const traceId = req.headers['x-trace-id'] || crypto.randomUUID();

    // Set header for the response so the client knows their trace ID
    res.setHeader('x-trace-id', traceId);

    // Persist the traceId in the async context
    storage.run({ traceId }, () => {
        next();
    });
};

module.exports = traceMiddleware;
