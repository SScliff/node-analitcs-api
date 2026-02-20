const logger = require('../services/monitoring/logger.service');
const { metrics } = require('../services/monitoring/metrics.service');

/**
 * Request Logger and Metrics Middleware
 * 
 * Centralizes:
 * 1. Success Logging (INFO)
 * 2. HTTP Metrics collection (Prometheus)
 * 3. Rate Limit Warning detection
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const route = req.route ? req.route.path : req.path;
        const status = res.statusCode;

        // 1. Success Logging (INFO)
        if (status < 400) {
            logger.info({
                module: 'http',
                action: 'request_success',
                method: req.method,
                route,
                status,
                duration: `${duration}ms`
            }, `Requisição processada com sucesso: ${req.method} ${route}`);
        }

        // 2. Metrics Collection
        metrics.httpRequestTotal.inc({
            method: req.method,
            route: route,
            status: status.toString()
        });

        // 3. Rate Limit Logging (Special Case)
        if (status === 429) {
            logger.warn({
                module: 'http',
                action: 'rate_limit_hit',
                method: req.method,
                route,
                ip: req.ip
            }, 'Limite de requisições excedido pelo cliente');
        }
    });

    next();
};

module.exports = requestLogger;
