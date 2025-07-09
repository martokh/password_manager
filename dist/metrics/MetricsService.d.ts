export declare class MetricsService {
    private registry;
    private vaultCreateDuration;
    private passwordGenerateCount;
    private encryptionFailures;
    constructor();
    recordVaultCreation(durationMs: number, status: 'success' | 'error'): void;
    incrementPasswordGeneration(): void;
    recordEncryptionFailure(operation: 'encrypt' | 'decrypt'): void;
    getMetrics(): Promise<string>;
}
