import { Bounty } from "@/types/bounty"

export const mockBounties: Bounty[] = [
  {
    id: "1",
    type: "bug",
    issueTitle: "Fix authentication redirect loop on Safari",
    projectId: "boundless-finance",
    projectName: "Boundless Finance",
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
    projectId: "boundless-finance",
    projectName: "Boundless Finance",
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
    projectId: "boundless-finance",
    projectName: "Boundless Finance",
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
    difficulty: "beginner",
    tags: ["documentation", "api", "openapi"],
    status: "closed",
    createdAt: "2025-01-05T12:00:00Z",
    updatedAt: "2025-01-12T16:00:00Z",
  },
]

export function getBountyById(id: string): Bounty | undefined {
  return mockBounties.find((bounty) => bounty.id === id)
}

export function getAllBounties(): Bounty[] {
  return mockBounties
}
