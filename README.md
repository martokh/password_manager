# Personal Password Manager

A secure, enterprise-grade password management solution with robust encryption and comprehensive security features.

## Architecture Overview

```mermaid
graph TD
    A[Client] --> B[API Gateway]
    B --> C[Password Manager Service]
    C --> D[Encryption Service]
    C --> E[Storage Service]
    D --> F[Key Management]
    E --> G[Secure Vault]
```

## Features

- Secure password generation
- End-to-end encryption
- Multi-factor authentication
- Audit logging
- Secure sharing capabilities

## Development

### Prerequisites

- Node.js 18+
- npm 8+
- Docker (for containerization)

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Start development server
npm run dev
```

### CI/CD Pipeline

Our pipeline ensures code quality and security through:

1. **Linting**: ESLint with security rules
2. **Testing**: Jest with 100% coverage requirement
3. **Security Scans**: 
   - npm audit
   - SonarQube SAST
   - Dependabot updates
4. **Build & Package**:
   - UMD/CJS/ESM bundles
   - Docker image
5. **Deployment**:
   - GitHub Container Registry
   - Automated rollback on failure

### Metrics & Monitoring

Key metrics tracked:

- `pm.vault.create.duration.p95` — 95th percentile time to initialize a new vault. High values may indicate backend or crypto performance issues.
- `pm.password.generate.count` — Total passwords generated per minute. Useful for usage analytics and anomaly detection.
- `pm.storage.encryption.failures` — Count of encryption/decryption errors. Any value >0 in a 5-minute window triggers an alert and potential rollback.

To view metrics locally, use the `/metrics` endpoint (if exposed) or check Prometheus/Grafana dashboards in production.

### Emergency Procedures

#### Rollback Process

Rollback is triggered automatically if:
- `pm.storage.encryption.failures > 0` in a 5-minute window
- End-to-end test suite fails on main branch

Manual steps:
1. Access the deployment dashboard
2. Locate the failing deployment
3. Execute rollback:
   ```bash
   kubectl rollout undo deployment/password-manager
   ```
4. Verify service health
5. Notify stakeholders via Slack:
   ```
   [ALERT] Password Manager deployment failed on main.
   Error metric: pm.storage.encryption.failures.
   Rolling back to previous version.
   ```

## Documentation & Onboarding

- **Confluence:**
  - [Password Manager Integration Guide](https://confluence.example.com/pages/password-manager-integration)
  - [Operational Runbook](https://confluence.example.com/pages/password-manager-runbook)
- **How to run tests locally:**
  - `npm test` for unit tests (Jest)
  - `npx cypress open` for integration tests
- **Metrics interpretation:** See above
- **Emergency rollback:** See above

## License

MIT
