import * as crypto from 'crypto';
import { MetricsService } from '../metrics/MetricsService';

export class VaultService {
  private metricsService: MetricsService;

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
  }

  public async createVault(userId: string, masterPassword: string): Promise<string> {
    const startTime = Date.now();
    try {
      // Generate vault key
      const salt = crypto.randomBytes(32);
      const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');
      const vaultId = crypto.randomUUID();

      // Record metrics
      this.metricsService.recordVaultCreation(Date.now() - startTime, 'success');
      
      return vaultId;
    } catch (error) {
      this.metricsService.recordVaultCreation(Date.now() - startTime, 'error');
      throw error;
    }
  }

  public generatePassword(length: number = 16): string {
    try {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      const password = Array.from(crypto.randomBytes(length))
        .map(byte => charset[byte % charset.length])
        .join('');
      
      this.metricsService.incrementPasswordGeneration();
      return password;
    } catch (error) {
      throw new Error('Failed to generate password');
    }
  }
}
