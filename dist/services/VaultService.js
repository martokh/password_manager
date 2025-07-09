"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultService = void 0;
const crypto = __importStar(require("crypto"));
const pino_1 = __importDefault(require("pino"));
const uuid_1 = require("uuid");
const logger = (0, pino_1.default)({
    level: 'info',
    formatters: {
        level(label) {
            return { level: label };
        },
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
});
class VaultService {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async createVault(userId, masterPassword, correlationId) {
        const startTime = Date.now();
        const corrId = correlationId || (0, uuid_1.v4)();
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
        }
        catch (error) {
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
    generatePassword(length = 16, correlationId) {
        const corrId = correlationId || (0, uuid_1.v4)();
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
        }
        catch (error) {
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
exports.VaultService = VaultService;
//# sourceMappingURL=VaultService.js.map