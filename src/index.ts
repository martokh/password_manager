import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { MetricsService } from './metrics/MetricsService';
import { VaultService } from './services/VaultService';
import { randomUUID } from 'crypto';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

// Initialize services
const logger = pino({
  level: 'info',
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

const metricsService = new MetricsService();
const vaultService = new VaultService(metricsService);

// Create Express app
const app = express();
app.use(express.json());

// Add correlation ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.correlationId = req.headers['x-correlation-id'] as string || randomUUID();
  next();
});

// Add logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({
    event: 'request.received',
    method: req.method,
    path: req.path,
    correlationId: req.correlationId,
  });
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  const metrics = await metricsService.getMetrics();
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Add a default web page for user experience
app.get('/', (_req: Request, res: Response) => {
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
app.post('/vaults', async (req: Request, res: Response) => {
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
  } catch (error) {
    logger.error({
      event: 'vault.creation.error',
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId: req.correlationId,
    });
    
    res.status(500).json({ error: 'Failed to create vault' });
  }
});

// Generate password endpoint
app.post('/passwords/generate', (req: Request, res: Response) => {
  try {
    const { length } = req.body;
    const password = vaultService.generatePassword(length);
    
    logger.info({
      event: 'password.generated',
      correlationId: req.correlationId,
    });
    
    res.status(200).json({ password });
  } catch (error) {
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
