import { Bounty } from "@/types/bounty"

export const mockBounties: Bounty[] = [
  {
    id: "1",
    type: "bug",
    issueTitle: "Fix authentication redirect loop on Safari",
    projectId: "boundless",
    projectName: "Boundless",
    projectLogoUrl: "/logo.svg",
    githubRepo: "boundlessfi/bounties",
    githubIssueUrl: "https://github.com/boundlessfi/bounties/issues/1",
    issueNumber: 1,
    description: `## Problem
Users on Safari are experiencing an infinite redirect loop when attempting to authenticate via GitHub OAuth.

## Steps to Reproduce
1. Open Safari browser
2. Navigate to the login page
3. Click "Sign in with GitHub"
4. After GitHub authorization, observe the redirect loop

## Expected Behavior
User should be redirected to the dashboard after successful authentication.

## Technical Notes
The issue appears to be related to cookie handling in Safari's strict privacy mode.`,
    requirements: [
      "Fix must work on Safari 16+",
      "Must not break existing Chrome/Firefox functionality",
      "Include unit tests for the fix",
      "Update documentation if needed",
    ],
    scope: "Authentication module only. Do not modify unrelated components.",
    rewardAmount: 500,
    rewardCurrency: "USDC",
    claimingModel: "single-claim",
    difficulty: "intermediate",
    tags: ["safari", "authentication", "oauth", "cookies"],
    status: "open",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-18T14:30:00Z",
  },
  {
    id: "2",
    type: "feature",
    issueTitle: "Implement dark mode toggle in settings",
    projectId: "boundless",
    projectName: "Boundless",
    projectLogoUrl: "/logo.svg",
    githubRepo: "boundlessfi/bounties",
    githubIssueUrl: "https://github.com/boundlessfi/bounties/issues/2",
    issueNumber: 2,
    description: `## Feature Request
Add a dark mode toggle to the application settings page that persists user preference.

## Requirements
- Toggle switch in settings
- Persist preference in localStorage
- Respect system preference as default
- Smooth transition between themes`,
    requirements: [
      "Use next-themes for implementation",
      "Add toggle to settings page",
      "Persist user preference",
      "Support system preference detection",
    ],
    rewardAmount: 300,
    rewardCurrency: "USDC",
    claimingModel: "single-claim",
    difficulty: "beginner",
    tags: ["ui", "theme", "settings", "dark-mode"],
    status: "claimed",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-17T11:00:00Z",
  },
  {
    id: "3",
    type: "documentation",
    issueTitle: "Write API documentation for bounty endpoints",
    projectId: "boundless",
    projectName: "Boundless",
    projectLogoUrl: "/logo.svg",
    githubRepo: "boundlessfi/bounties",
    githubIssueUrl: "https://github.com/boundlessfi/bounties/issues/3",
    issueNumber: 3,
    description: `## Documentation Needed
Create comprehensive API documentation for all bounty-related endpoints.

## Endpoints to Document
- GET /api/bounties
- GET /api/bounties/:id
- POST /api/bounties/:id/claim
- POST /api/bounties/:id/submit`,
    rewardAmount: 200,
    rewardCurrency: "USDC",
    claimingModel: "single-claim",
    difficulty: "beginner",
    tags: ["documentation", "api", "openapi"],
    status: "closed",
    createdAt: "2025-01-05T12:00:00Z",
    updatedAt: "2025-01-12T16:00:00Z",
  },
  {
    id: "4",
    type: "feature",
    issueTitle: "Add wallet connection support",
    projectId: "boundless",
    projectName: "Boundless",
    projectLogoUrl: "/logo.svg",
    githubRepo: "boundlessfi/platform",
    githubIssueUrl: "https://github.com/boundlessfi/platform/issues/45",
    issueNumber: 45,
    description: `## Feature Request
Implement wallet connection functionality using Freighter and other popular Stellar wallets.

## Requirements
- Support multiple wallet providers
- Handle connection/disconnection flows
- Display connected wallet address
- Persist wallet connection state`,
    requirements: [
      "Support Freighter wallet",
      "Support xBull wallet",
      "Add wallet selection modal",
      "Handle wallet disconnect gracefully",
    ],
    rewardAmount: 800,
    rewardCurrency: "XLM",
    claimingModel: "competition",
    difficulty: "advanced",
    tags: ["wallet", "stellar", "web3", "freighter"],
    status: "open",
    createdAt: "2025-01-20T09:00:00Z",
    updatedAt: "2025-01-23T11:30:00Z",
  },
  {
    id: "5",
    type: "bug",
    issueTitle: "Fix pagination on bounties list",
    projectId: "boundless",
    projectName: "Boundless",
    projectLogoUrl: "/logo.svg",
    githubRepo: "boundlessfi/platform",
    githubIssueUrl: "https://github.com/boundlessfi/platform/issues/52",
    issueNumber: 52,
    description: `## Bug Description
Pagination controls are not working correctly when filtering bounties.

## Steps to Reproduce
1. Apply filters to bounties list
2. Navigate to page 2
3. Change filter
4. Pagination state is not reset`,
    rewardAmount: 150,
    rewardCurrency: "USDC",
    claimingModel: "single-claim",
    difficulty: "beginner",
    tags: ["pagination", "ui", "bug"],
    status: "open",
    createdAt: "2025-01-22T14:00:00Z",
    updatedAt: "2025-01-23T10:15:00Z",
  },
  {
    id: "6",
    type: "refactor",
    issueTitle: "Refactor API client to use axios",
    projectId: "boundless",
    projectName: "Boundless",
    projectLogoUrl: "/logo.svg",
    githubRepo: "boundlessfi/platform",
    githubIssueUrl: "https://github.com/boundlessfi/platform/issues/38",
    issueNumber: 38,
    description: `## Refactoring Task
Replace current fetch-based API client with axios for better error handling and interceptor support.`,
    rewardAmount: 400,
    rewardCurrency: "USDC",
    claimingModel: "multi-winner",
    difficulty: "intermediate",
    tags: ["refactor", "api", "axios"],
    status: "claimed",
    createdAt: "2025-01-18T08:00:00Z",
    updatedAt: "2025-01-21T16:45:00Z",
  },
  {
    id: "7",
    type: "feature",
    issueTitle: "Implement Soroban smart contract integration",
    projectId: "soroban-kit",
    projectName: "Soroban Kit",
    projectLogoUrl: null,
    githubRepo: "soroban-kit/sdk",
    githubIssueUrl: "https://github.com/soroban-kit/sdk/issues/12",
    issueNumber: 12,
    description: `## Feature Request
Add helper functions for common Soroban smart contract patterns.

## Scope
- Token contract interactions
- Authorization patterns
- Error handling utilities
- Testing helpers`,
    requirements: [
      "Implement token transfer helpers",
      "Add authorization wrappers",
      "Create testing utilities",
      "Include TypeScript types",
    ],
    rewardAmount: 1200,
    rewardCurrency: "XLM",
    claimingModel: "application",
    difficulty: "advanced",
    tags: ["soroban", "smart-contracts", "stellar", "sdk"],
    status: "open",
    createdAt: "2025-01-19T10:30:00Z",
    updatedAt: "2025-01-24T09:20:00Z",
  },
  {
    id: "8",
    type: "bug",
    issueTitle: "Fix contract deployment script errors",
    projectId: "soroban-kit",
    projectName: "Soroban Kit",
    projectLogoUrl: null,
    githubRepo: "soroban-kit/sdk",
    githubIssueUrl: "https://github.com/soroban-kit/sdk/issues/18",
    issueNumber: 18,
    description: `## Bug Report
Deployment scripts fail on testnet with network timeout errors.

## Environment
- Network: Stellar Testnet
- Node version: 18.x
- Soroban CLI: 20.0.0`,
    rewardAmount: 300,
    rewardCurrency: "USDC",
    claimingModel: "single-claim",
    difficulty: "intermediate",
    tags: ["deployment", "testnet", "bug", "scripts"],
    status: "open",
    createdAt: "2025-01-21T11:00:00Z",
    updatedAt: "2025-01-23T15:30:00Z",
  },
  {
    id: "9",
    type: "documentation",
    issueTitle: "Create getting started guide",
    projectId: "soroban-kit",
    projectName: "Soroban Kit",
    projectLogoUrl: null,
    githubRepo: "soroban-kit/sdk",
    githubIssueUrl: "https://github.com/soroban-kit/sdk/issues/5",
    issueNumber: 5,
    description: `## Documentation Request
Write comprehensive getting started guide for new developers.

## Sections Needed
- Installation
- Quick start example
- Core concepts
- Common patterns
- Troubleshooting`,
    rewardAmount: 250,
    rewardCurrency: "USDC",
    claimingModel: "single-claim",
    difficulty: "beginner",
    tags: ["documentation", "tutorial", "getting-started"],
    status: "open",
    createdAt: "2025-01-15T13:00:00Z",
    updatedAt: "2025-01-22T10:00:00Z",
  },
  {
    id: "10",
    type: "feature",
    issueTitle: "Add zero-knowledge proof primitives",
    projectId: "stellar-privacy-lab",
    projectName: "Stellar Privacy Lab",
    projectLogoUrl: null,
    githubRepo: "stellar-privacy/zkp",
    githubIssueUrl: "https://github.com/stellar-privacy/zkp/issues/3",
    issueNumber: 3,
    description: `## Research Feature
Implement basic zero-knowledge proof primitives for private transactions on Stellar.

## Requirements
- Research ZK-SNARK implementations
- Prototype basic proof generation
- Integration with Stellar transactions
- Performance benchmarks`,
    requirements: [
      "Research suitable ZK libraries",
      "Implement proof generation",
      "Create verification contracts",
      "Document performance characteristics",
    ],
    rewardAmount: 2000,
    rewardCurrency: "XLM",
    claimingModel: "competition",
    difficulty: "advanced",
    tags: ["zkp", "privacy", "cryptography", "research"],
    status: "open",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-24T14:20:00Z",
  },
  {
    id: "11",
    type: "bug",
    issueTitle: "Fix privacy protocol memory leaks",
    projectId: "stellar-privacy-lab",
    projectName: "Stellar Privacy Lab",
    projectLogoUrl: null,
    githubRepo: "stellar-privacy/core",
    githubIssueUrl: "https://github.com/stellar-privacy/core/issues/7",
    issueNumber: 7,
    description: `## Bug Description
Memory leaks detected in privacy protocol implementation during extended operations.`,
    rewardAmount: 600,
    rewardCurrency: "USDC",
    claimingModel: "application",
    difficulty: "advanced",
    tags: ["bug", "memory", "performance", "privacy"],
    status: "open",
    createdAt: "2025-01-19T16:00:00Z",
    updatedAt: "2025-01-23T12:45:00Z",
  },
]

export function getBountyById(id: string): Bounty | undefined {
  return mockBounties.find((bounty) => bounty.id === id)
}

export function getAllBounties(): Bounty[] {
  return mockBounties
}
