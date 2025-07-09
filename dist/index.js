"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pino_1 = __importDefault(require("pino"));
const MetricsService_1 = require("./metrics/MetricsService");
const VaultService_1 = require("./services/VaultService");
const crypto_1 = require("crypto");
// Initialize services
const logger = (0, pino_1.default)({
    level: 'info',
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
});
const metricsService = new MetricsService_1.MetricsService();
const vaultService = new VaultService_1.VaultService(metricsService);
// Create Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Add correlation ID middleware
app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || (0, crypto_1.randomUUID)();
    next();
});
// Add logging middleware
app.use((req, res, next) => {
    logger.info({
        event: 'request.received',
        method: req.method,
        path: req.path,
        correlationId: req.correlationId,
    });
    next();
});
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
});
// Metrics endpoint
app.get('/metrics', async (_req, res) => {
    const metrics = await metricsService.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
});
// Add a default web page for user experience
app.get('/', (_req, res) => {
    res.send(`
    <html>
      <head>
        <title>Password Manager API</title>
      </head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 5em;">
        <h1>🔐 Personal Password Manager</h1>
        <p>Welcome! The API is running.</p>
        <ul style="list-style: none; padding: 0;">
          <li><a href='/health'>Health Check</a></li>
          <li><a href='/metrics'>Metrics</a></li>
        </ul>
        <p>Use <code>/vaults</code> and <code>/passwords/generate</code> endpoints with an API client (curl, Postman, etc).</p>
      </body>
    </html>
  `);
});
// Create vault endpoint
app.post('/vaults', async (req, res) => {
    try {
        const { userId, masterPassword } = req.body;
        const vaultId = await vaultService.createVault(userId, masterPassword);
        logger.info({
            event: 'vault.created',
            userId,
            vaultId,
            correlationId: req.correlationId,
        });
        res.status(201).json({ vaultId });
    }
    catch (error) {
        logger.error({
            event: 'vault.creation.error',
            error: error instanceof Error ? error.message : 'Unknown error',
            correlationId: req.correlationId,
        });
        res.status(500).json({ error: 'Failed to create vault' });
    }
});
// Generate password endpoint
app.post('/passwords/generate', (req, res) => {
    try {
        const { length } = req.body;
        const password = vaultService.generatePassword(length);
        logger.info({
            event: 'password.generated',
            correlationId: req.correlationId,
        });
        res.status(200).json({ password });
    }
    catch (error) {
        logger.error({
            event: 'password.generation.error',
            error: error instanceof Error ? error.message : 'Unknown error',
            correlationId: req.correlationId,
        });
        res.status(500).json({ error: 'Failed to generate password' });
    }
});
// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info({
        event: 'server.started',
        port,
    });
});
//# sourceMappingURL=index.js.map