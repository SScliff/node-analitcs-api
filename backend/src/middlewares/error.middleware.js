const logger = require('../services/monitoring/logger.service');
const config = require('../config');

/**
 * Enhanced Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    const isDevelopment = config.app.env === 'development';

    // Preparation of log payload
    const logPayload = {
        module: 'app',
        action: 'error_handler',
        message: err.message,
        url: req.url,
        method: req.method,
        statusCode: err.statusCode
    };

    // Logging Conversation: 
    // 5xx = ERROR (Server fault)
    // 4xx = WARN (Client fault)
    if (err.statusCode >= 500) {
        logPayload.stack = err.stack;
        logger.error(logPayload, 'Erro Critico!');
    } else {
        logger.warn(logPayload, 'AVISO: Requisição inválida ou erro operacional');
    }

    // Response to client
    res.status(err.statusCode).json({
        error: err.statusCode >= 500 ? 'Erro interno no servidor' : 'Erro na requisição',
        message: err.message,
        // Hide details in production for security
        ...(isDevelopment && { stack: err.stack, details: err.details || [] })
    });
};

module.exports = errorHandler;
