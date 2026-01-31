# Boundless Bounty

<div align="center">

![Stellar](https://img.shields.io/badge/Stellar-Blockchain-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-in%20development-orange)

**Inclusive Web3 Bounty Platform on Stellar**

[Website](https://boundlessfi.xyz) • [Platform](https://bounty.boundlessfi.xyz) • [Discord](https://discord.gg/5Xpwrt9Q)

</div>

---

## Overview

Boundless Bounty is an open-source bounty platform built on Stellar that supports all types of Web3 work—not just code. Contributors can earn XLM for design, writing, research, marketing, community management, and development tasks.

**Key Features:**

- 🎯 Multiple bounty claiming models
- ⚡ Credit-based application system
- 🔐 Passkey wallet integration
- 💰 Smart contract escrow
- 📊 On-chain reputation system

---

## Tech Stack

**Blockchain:**

- Stellar Network
- Soroban Smart Contracts
- [smart-account-kit](https://github.com/kalepail/smart-account-kit) for passkey wallets

**Frontend:**

- React/Next.js
- TailwindCSS
- Stellar SDK

**Backend:**

- Node.js/Express
- PostgreSQL
- Redis (caching)

**Integrations:**

- GitHub OAuth
- KYC providers
- Payment processors

---

## Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/boundlessfi/bounties.git
cd bounty

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

---

## Key Concepts

### Bounty Models

1. **Single Claim**: First to claim gets exclusive rights
2. **Application**: Projects review and select from proposals
3. **Competition**: Multiple submissions, best wins
4. **Multi-Winner**: Milestone-based with parallel contributors

### Credit System

Users need credits ("Spark") to apply for bounties. Credits are earned through:

- Completing bounties
- Bi-weekly recharge
- Participation rewards

### Smart Contract Escrow

All bounty budgets are locked in Soroban smart contracts until work is approved.

---

## Development

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Smart contract tests
npm run test:contracts
```

### Building

```bash
# Production build
npm run build
```

### Code Style

We use ESLint and Prettier:

```bash
npm run lint
npm run format
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Areas for Contribution

- Frontend components and UI/UX improvements
- API endpoints and services
- Documentation
- Testing and QA
- Bug fixes and security patches

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## API Endpoints

### Bounties

```
GET    /api/bounties              # List all bounties
GET    /api/bounties/:id          # Get bounty details
POST   /api/bounties              # Create bounty (auth required)
PUT    /api/bounties/:id          # Update bounty (auth required)
DELETE /api/bounties/:id          # Delete bounty (auth required)
```

### Applications

```
GET    /api/applications          # List applications
POST   /api/applications          # Submit application (auth required)
PUT    /api/applications/:id      # Update application (auth required)
```

### Users

```
GET    /api/users/:id             # Get user profile
PUT    /api/users/:id             # Update profile (auth required)
GET    /api/users/:id/reputation  # Get reputation score
```

---

## Security

### Reporting Vulnerabilities

Please report security vulnerabilities to <security@boundlessfi.xyz>. Do not open public issues for security concerns.

### Security Features

- Passkey authentication (WebAuthn)
- Smart contract escrow
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- SQL injection prevention

---

## Deployment

---

## Testing

### Frontend Testing

```bash
cd frontend
npm run test
npm run test:e2e
```

### Backend Testing

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Resources

- **Documentation**: [docs/](./docs)
- **API Reference**: [docs/API.md](./docs/API.md)
- **Smart Contract Docs**: [docs/CONTRACTS.md](./docs/CONTRACTS.md)
- **Stellar Docs**: [stellar.org/docs](https://stellar.org/docs)
- **Soroban Docs**: [soroban.stellar.org](https://soroban.stellar.org)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/boundlessfi/bounty/issues)
- **Discord**: [Join our server](https://discord.gg/boundless)
- **Email**: <dev@boundlessfi.xyz>

---

## Acknowledgments

Built with:

- [Stellar](https://stellar.org)
- [Soroban](https://soroban.stellar.org)
- [smart-account-kit](https://github.com/kalepail/smart-account-kit)

---

<div align="center">

**Built on Stellar**

[Website](https://boundlessfi.xyz) • [Platform](https://bounty.boundlessfi.xyz) • [Discord](https://discord.gg/5Xpwrt9Q)

</div>
