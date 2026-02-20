require('dotenv').config();
const app = require('./app');
const logger = require('./services/logger.service');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info({ module: 'server', action: 'startup', port: PORT }, `Api rodando na porta: ${PORT}`);
});
