const logger = require('../services/monitoring/logger.service');

/**
 * Global Error Handling Middleware
 * Centralizes all application errors, ensuring they return a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Erro interno no servidor';

    logger.error({
        module: 'app',
        action: 'global_error_handler',
        error: message,
        stack: err.stack,
        url: req.url,
        method: req.method
    }, 'Erro não tratado capturado');

    res.status(status).json({
        error: status === 500 ? 'Erro interno no servidor' : 'Erro na requisição',
        message: message
    });
};

module.exports = errorHandler;
