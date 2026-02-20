const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'node-analytics-api'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// --- Custom Metrics ---

// Counter for total requests
const httpRequestTotal = new client.Counter({
    name: 'http_request_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});

// Gauge for active DB connections (we will update this from db.service)
const dbConnectionsActive = new client.Gauge({
    name: 'db_connections_active',
    help: 'Number of active database connections in the pool',
});

// Summary for query duration
const dbQueryDuration = new client.Summary({
    name: 'db_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['query_type'],
});

register.registerMetric(httpRequestTotal);
register.registerMetric(dbConnectionsActive);
register.registerMetric(dbQueryDuration);

module.exports = {
    register,
    metrics: {
        httpRequestTotal,
        dbConnectionsActive,
        dbQueryDuration
    }
};
