require('dotenv').config();

const config = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    database: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },
    security: {
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
            limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
        },
        trustedIps: (process.env.TRUSTED_IPS || '127.0.0.1,::1,::ffff:127.0.0.1,::ffff:172.18.0.1').split(',')
    }
};

module.exports = config;
