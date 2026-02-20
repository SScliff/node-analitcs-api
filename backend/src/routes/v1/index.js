const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const ticketRoutes = require('./ticket.routes');
const metricsRoutes = require('./metrics.routes');

router.use('/health', healthRoutes);
router.use('/tickets', ticketRoutes);
router.use('/metrics', metricsRoutes);

module.exports = router;
