const { Pool } = require('pg');
const { metrics } = require('../monitoring/metrics.service');
const { database: dbConfig } = require('../../config');
const logger = require('../monitoring/logger.service');

/**
 * Database Service & Connection Pool Study
 */

const pool = new Pool(dbConfig);

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
