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
            windowMs: 60 * 1000, // 1 minute
            limit: 100
        }
    }
};

module.exports = config;
