"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const prom_client_1 = require("prom-client");
class MetricsService {
    constructor() {
        this.registry = new prom_client_1.Registry();
        // Vault creation duration histogram
        this.vaultCreateDuration = new prom_client_1.Histogram({
            name: 'pm_vault_create_duration',
            help: 'Time taken to initialize a new vault',
            labelNames: ['status'],
            buckets: [0.1, 0.5, 1, 2, 5],
            registers: [this.registry]
        });
        // Password generation counter
        this.passwordGenerateCount = new prom_client_1.Counter({
            name: 'pm_password_generate_count',
            help: 'Total passwords generated',
            registers: [this.registry]
        });
        // Encryption failures counter
        this.encryptionFailures = new prom_client_1.Counter({
            name: 'pm_storage_encryption_failures',
            help: 'Count of encryption/decryption errors',
            labelNames: ['operation'],
            registers: [this.registry]
        });
    }
    // Record vault creation duration
    recordVaultCreation(durationMs, status) {
        this.vaultCreateDuration.labels(status).observe(durationMs / 1000);
    }
    // Increment password generation counter
    incrementPasswordGeneration() {
        this.passwordGenerateCount.inc();
    }
    // Record encryption failure
    recordEncryptionFailure(operation) {
        this.encryptionFailures.labels(operation).inc();
    }
    // Get metrics
    async getMetrics() {
        return await this.registry.metrics();
    }
}
exports.MetricsService = MetricsService;
//# sourceMappingURL=MetricsService.js.map