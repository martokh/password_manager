import { VaultService } from './VaultService';
import { MetricsService } from '../metrics/MetricsService';

// Mock prom-client metrics to bypass metric name validation for tests
jest.mock('prom-client', () => {
  const actual = jest.requireActual('prom-client');
  class MockHistogram {
    labels() { return this; }
    observe() {}
  }
  class MockCounter {
    labels() { return this; }
    inc() {}
  }
  return {
    ...actual,
    Registry: jest.fn().mockImplementation(() => ({})),
    Histogram: MockHistogram,
    Counter: MockCounter,
  };
});

describe('VaultService', () => {
    let vaultService: VaultService;
    let metricsService: MetricsService;

    beforeEach(() => {
        metricsService = new MetricsService();
        vaultService = new VaultService(metricsService);
    });

    describe('createVault', () => {
        it('should create a vault and return a vault ID', async () => {
            const userId = 'test-user';
            const masterPassword = 'secure-password';

            const vaultId = await vaultService.createVault(userId, masterPassword);
            expect(vaultId).toBeDefined();
            expect(typeof vaultId).toBe('string');
            expect(vaultId.length).toBeGreaterThan(0);
        });

        it('should record metrics on successful vault creation', async () => {
            const spy = jest.spyOn(metricsService, 'recordVaultCreation');
            await vaultService.createVault('user', 'pass');
            expect(spy).toHaveBeenCalledWith(expect.any(Number), 'success');
        });

        it('should record metrics on error during vault creation', async () => {
            // Simulate error by mocking pbkdf2Sync to throw
            jest.spyOn(require('crypto'), 'pbkdf2Sync').mockImplementation(() => { throw new Error('fail'); });
            const spy = jest.spyOn(metricsService, 'recordVaultCreation');
            await expect(vaultService.createVault('user', 'pass')).rejects.toThrow('fail');
            expect(spy).toHaveBeenCalledWith(expect.any(Number), 'error');
            jest.restoreAllMocks();
        });
    });

    describe('generatePassword', () => {
        it('should generate a password of specified length', () => {
            const length = 20;
            const password = vaultService.generatePassword(length);

            expect(password).toBeDefined();
            expect(password.length).toBe(length);
            expect(typeof password).toBe('string');
        });

        it('should generate different passwords on consecutive calls', () => {
            const password1 = vaultService.generatePassword();
            const password2 = vaultService.generatePassword();

            expect(password1).not.toBe(password2);
        });

        it('should use default length of 16 when no length specified', () => {
            const password = vaultService.generatePassword();
            expect(password.length).toBe(16);
        });

        it('should call metrics incrementPasswordGeneration', () => {
            const spy = jest.spyOn(metricsService, 'incrementPasswordGeneration');
            vaultService.generatePassword();
            expect(spy).toHaveBeenCalled();
        });

        it('should throw error if randomBytes fails', () => {
            jest.spyOn(require('crypto'), 'randomBytes').mockImplementation(() => { throw new Error('fail'); });
            expect(() => vaultService.generatePassword()).toThrow('Failed to generate password');
            jest.restoreAllMocks();
        });
    });
});
