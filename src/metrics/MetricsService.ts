import { Registry, Histogram, Counter } from 'prom-client';

export class MetricsService {
  private registry: Registry;
  private vaultCreateDuration: Histogram;
  private passwordGenerateCount: Counter;
  private encryptionFailures: Counter;

  constructor() {
    this.registry = new Registry();

    // Vault creation duration histogram
    this.vaultCreateDuration = new Histogram({
      name: 'pm_vault_create_duration',
      help: 'Time taken to initialize a new vault',
      labelNames: ['status'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry]
    });

    // Password generation counter
    this.passwordGenerateCount = new Counter({
      name: 'pm_password_generate_count',
      help: 'Total passwords generated',
      registers: [this.registry]
    });

    // Encryption failures counter
    this.encryptionFailures = new Counter({
      name: 'pm_storage_encryption_failures',
      help: 'Count of encryption/decryption errors',
      labelNames: ['operation'],
      registers: [this.registry]
    });
  }

  // Record vault creation duration
  public recordVaultCreation(durationMs: number, status: 'success' | 'error'): void {
    this.vaultCreateDuration.labels(status).observe(durationMs / 1000);
  }

  // Increment password generation counter
  public incrementPasswordGeneration(): void {
    this.passwordGenerateCount.inc();
  }

  // Record encryption failure
  public recordEncryptionFailure(operation: 'encrypt' | 'decrypt'): void {
    this.encryptionFailures.labels(operation).inc();
  }

  // Get metrics
  public async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}
