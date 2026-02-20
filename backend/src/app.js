const express = require('express');
const logger = require('./services/monitoring/logger.service');
const helmet = require('helmet');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const ticketRoutes = require('./routes/ticket.routes');
const rateLimit = require('./middlewares/rateLimit.middleware');
const errorHandler = require('./middlewares/error.middleware');
const requestLogger = require('./middlewares/requestLogger.middleware');
const { register } = require('./services/monitoring/metrics.service');

const app = express();

// --- Global Middlewares ---
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
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

// --- Error Handling ---
app.use(errorHandler);

module.exports = app;
