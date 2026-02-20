const { Pool } = require('pg');
const { metrics } = require('./metrics.service');
const logger = require('./logger.service');

/**
 * Database Service & Connection Pool Study
 * 
 * Objectives:
 * 1. Control the number of maximum connections (max).
 * 2. Monitor connection acquisition time.
 * 3. Study idle connection timeouts.
 */

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Update gauge when pool events happen
pool.on('connect', () => {
    metrics.dbConnectionsActive.inc();
    logger.info({ module: 'db', action: 'connect' }, 'Nova conexão estabelecida com o Postgres');
});

pool.on('remove', () => {
    metrics.dbConnectionsActive.dec();
});

pool.on('error', (err) => {
    logger.error({ module: 'db', action: 'pool_error', err }, 'Erro inesperado no pool do Postgres');
});

module.exports = {
    query: async (text, params) => {
        const start = Date.now();
        try {
            const res = await pool.query(text, params);
            const duration = (Date.now() - start) / 1000;

            // Record query duration
            metrics.dbQueryDuration.observe({ query_type: text.split(' ')[0] }, duration);

            if (!res || !res.rows) {
                logger.warn({ module: 'db', action: 'query_empty', query: text }, 'AVISO: res ou res.rows está indefinido!');
            }

            return res;
        } catch (error) {
            logger.error({ module: 'db', action: 'query_failed', query: text, error }, 'Erro na query');
            throw error;
        }
    },
    pool // Exposing for more advanced monitoring if needed
};
