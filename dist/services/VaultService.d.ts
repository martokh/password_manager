import { MetricsService } from '../metrics/MetricsService';
export declare class VaultService {
    private metricsService;
    constructor(metricsService: MetricsService);
    createVault(userId: string, masterPassword: string, correlationId?: string): Promise<string>;
    generatePassword(length?: number, correlationId?: string): string;
}
