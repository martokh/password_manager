import * as crypto from 'crypto';
import { MetricsService } from '../metrics/MetricsService';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

const logger = pino({
  level: 'info',
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export class VaultService {
  private metricsService: MetricsService;

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
  }

  public async createVault(userId: string, masterPassword: string, correlationId?: string): Promise<string> {
    const startTime = Date.now();
    const corrId = correlationId || uuidv4();
    try {
      // Generate vault key
      const salt = crypto.randomBytes(32);
      const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');
      const vaultId = crypto.randomUUID();

      // Record metrics
      this.metricsService.recordVaultCreation(Date.now() - startTime, 'success');

      logger.info({
        timestamp: new Date().toISOString(),
        level: 'info',
        event: 'vault.create.success',
        userId,
        correlationId: corrId,
        message: 'Vault created successfully',
      });
      return vaultId;
    } catch (error) {
      this.metricsService.recordVaultCreation(Date.now() - startTime, 'error');
      logger.error({
        timestamp: new Date().toISOString(),
        level: 'error',
        event: 'vault.encryption.error',
        userId,
        correlationId: corrId,
        message: 'Failed to encrypt vault key',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public generatePassword(length: number = 16, correlationId?: string): string {
    const corrId = correlationId || uuidv4();
    try {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      const password = Array.from(crypto.randomBytes(length))
        .map(byte => charset[byte % charset.length])
        .join('');

      this.metricsService.incrementPasswordGeneration();
      logger.info({
        timestamp: new Date().toISOString(),
        level: 'info',
        event: 'password.generate.success',
        correlationId: corrId,
        message: 'Password generated',
      });
      return password;
    } catch (error) {
      logger.error({
        timestamp: new Date().toISOString(),
        level: 'error',
        event: 'password.generate.error',
        correlationId: corrId,
        message: 'Failed to generate password',
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to generate password');
    }
  }
}
