const pino = require('pino');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // In production, we want raw JSON for Loki
    // In development (local terminal), we could use pino-pretty
    // For this study, we'll use raw JSON to see how Loki handles it
    base: {
        app: 'node-analytics-api',
        env: process.env.NODE_ENV || 'development'
    },
    timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
