const pino = require('pino');
const storage = require('../../utils/storage');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base: {
        app: 'node-analytics-api',
        env: process.env.NODE_ENV || 'development'
    },
    // The mixin automatically injects data into every log call
    mixin() {
        const store = storage.getStore();
        return store ? { traceId: store.traceId } : {};
    },
    timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
