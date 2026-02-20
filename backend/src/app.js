const express = require('express');
const logger = require('./services/logger.service');
const helmet = require('helmet');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const ticketRoutes = require('./routes/ticket.routes');
const rateLimit = require('./middlewares/rateLimit.middleware');
const { register, metrics } = require('./services/metrics.service');

const app = express();

// --- Middlewares ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// Metrics Middleware
app.use((req, res, next) => {
    res.on('finish', () => {
        const route = req.route ? req.route.path : req.path;
        const status = res.statusCode.toString();

        // Debug log to see if 429s are hitting this middleware
        if (status === '429') {
            logger.warn({ module: 'http', action: 'metrics_collection', route, status }, 'Capturando erro 429');
        }

        metrics.httpRequestTotal.inc({
            method: req.method,
            route: route,
            status: status
        });
    });
    next();
});

// Rate limiting (Global)
app.use(rateLimit);

// --- Routes ---
app.use('/health', healthRoutes);
app.use('/tickets', ticketRoutes);

// Metrics Endpoint for Prometheus
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

module.exports = app;
