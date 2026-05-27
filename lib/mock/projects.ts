import type { Project } from "@/types/project";
import type { Project as DiscoverProject } from "@/lib/types";

export function makeMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-" + Math.random().toString(36).substr(2, 9),
    name: "Mock Project",
    logoUrl: "/logo-icon.png",
    description: "Mock description",
    tags: [],
    bountyCount: 0,
    openBountyCount: 0,
    creatorName: "Mock Creator",
    creatorAvatarUrl: null,
    prizeAmount: "$0",
    status: "Active",
    bannerUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Project;
}

export function makeMockDiscoverProject(
  overrides: Partial<DiscoverProject> = {},
): DiscoverProject {
  return {
    id: "proj-" + Math.random().toString(36).substr(2, 9),
    title: "Mock Discover Project",
    description: "Mock description",
    tags: [],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: "creator",
    category: "category",
    ...overrides,
  } as DiscoverProject;
}

export const mockProjects: Project[] = [
  {
    id: "boundless",
    name: "Boundless",
    logoUrl: "/logo-icon.png",
    websiteUrl: "https://www.boundlessfi.xyz",
    description:
      "Boundless is building a better way to ship open-source work with transparent funding, milestone-based payouts, and community validation.",
    tags: ["Infrastructure", "Grants", "Bounties", "Stellar"],
    bountyCount: 12,
    openBountyCount: 4,
    creatorName: "Boundless Team",
    creatorAvatarUrl: "https://github.com/shadcn.png",
    prizeAmount: "$12,000",
    status: "Active",
    bannerUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    createdAt: "2025-01-05T12:00:00Z",
    updatedAt: "2025-01-18T14:30:00Z",
    maintainers: [
      {
        userId: "1",
        username: "boundless-admin",
        avatarUrl: "https://github.com/shadcn.png",
        profileUrl: "https://github.com/boundless-admin",
      },
      {
        userId: "2",
        username: "dev-team",
        avatarUrl: "https://github.com/vercel.png",
        profileUrl: "https://github.com/dev-team",
      },
    ],
  },
  {
    id: "nivo-ui-stellar-build",
    name: "NivoUI Stellar Build Hackathon",
    logoUrl: "/logo-icon.png",
    description: "From idea to on-chain in hours, not weeks.",
    tags: ["Infrastructure", "DeFi", "Privacy"],
    bountyCount: 8,
    openBountyCount: 0,
    creatorName: "Thritn",
    creatorAvatarUrl: "https://github.com/steven-tey.png",
    prizeAmount: "$180",
    status: "Ended",
    bannerUrl:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop",
    createdAt: "2024-12-20T09:00:00Z",
    updatedAt: "2025-01-02T16:15:00Z",
  },
  {
    id: "soroban-kit",
    name: "Soroban Kit",
    logoUrl: "/logo-icon.png",
    websiteUrl: "https://soroban-kit.dev",
    description:
      "Utilities, templates, and SDK helpers for building Soroban apps. Includes testing harnesses, example contracts, and deployment workflows.",
    tags: ["DeFi", "Infrastructure", "SDK", "Soroban"],
    bountyCount: 22,
    openBountyCount: 9,
    creatorName: "Soroban Devs",
    creatorAvatarUrl: null,
    prizeAmount: "$5,000",
    status: "Active",
    bannerUrl:
      "https://images.unsplash.com/photo-1644088379091-d574269d422f?q=80&w=2893&auto=format&fit=crop",
    createdAt: "2025-01-12T08:30:00Z",
    updatedAt: "2025-01-21T10:05:00Z",
    maintainers: [
      {
        userId: "3",
        username: "soroban-core",
        avatarUrl: "https://github.com/soroban-core.png",
        profileUrl: "https://github.com/soroban-core",
      },
    ],
  },
  {
    id: "stellar-privacy-lab",
    name: "Stellar Privacy Lab",
    logoUrl: "/logo-icon.png",
    websiteUrl: "https://privacy.stellar.org",
    description:
      "Research and prototypes focused on privacy-preserving primitives and integrations for Stellar—bringing safer defaults to on-chain apps.",
    tags: ["Privacy", "Research", "Crypto"],
    bountyCount: 5,
    openBountyCount: 2,
    creatorName: "Privacy Lab",
    creatorAvatarUrl: null,
    prizeAmount: "$3,500",
    status: "Active",
    bannerUrl:
      "https://images.unsplash.com/photo-1639762681057-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    createdAt: "2025-01-02T11:00:00Z",
    updatedAt: "2025-01-23T18:45:00Z",
    maintainers: [
      {
        userId: "4",
        username: "privacy-research",
        avatarUrl: "https://github.com/privacy-research.png",
        profileUrl: "https://github.com/privacy-research",
      },
      {
        userId: "5",
        username: "stellar-labs",
        avatarUrl: "https://github.com/stellar-labs.png",
        profileUrl: "https://github.com/stellar-labs",
      },
    ],
  },
];

export function getAllProjects(): Project[] {
  return mockProjects;
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getAllProjectTags(
  projects: Project[] = mockProjects,
): string[] {
  const set = new Set<string>();
  for (const p of projects) {
    for (const t of p.tags) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

// From mock-data.ts
export const mockDiscoverProjects: DiscoverProject[] = [
  {
    id: "proj-1",
    title: "Stellar DeFi Dashboard",
    description:
      "A comprehensive dashboard for tracking DeFi protocols on Stellar network. Features real-time analytics, portfolio tracking, and yield optimization.",
    tags: ["DeFi", "Frontend", "Analytics", "Stellar"],
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    creator: "stellar_dev",
    category: "DeFi",
    milestones: 5,
    completedMilestones: 3,
  },
  {
    id: "proj-2",
    title: "NFT Marketplace on Stellar",
    description:
      "Decentralized NFT marketplace built on Stellar. Supports minting, trading, and royalty management with low transaction fees.",
    tags: ["NFT", "Smart Contracts", "Full Stack", "Stellar"],
    status: "active",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z",
    creator: "nft_builder",
    category: "NFT",
    milestones: 8,
    completedMilestones: 5,
  },
  {
    id: "proj-3",
    title: "Cross-Chain Bridge Protocol",
    description:
      "Secure bridge protocol enabling asset transfers between Stellar and other major blockchains.",
    tags: ["DeFi", "Smart Contracts", "Security", "Infrastructure"],
    status: "active",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
    creator: "bridge_team",
    category: "Infrastructure",
    milestones: 6,
    completedMilestones: 2,
  },
  {
    id: "proj-4",
    title: "Stellar Mobile Wallet",
    description:
      "User-friendly mobile wallet for Stellar assets with built-in DEX integration and staking features.",
    tags: ["Mobile", "Frontend", "Web3", "Stellar"],
    status: "active",
    createdAt: "2023-12-20T00:00:00Z",
    updatedAt: "2024-01-21T00:00:00Z",
    creator: "mobile_dev",
    category: "Wallet",
    milestones: 10,
    completedMilestones: 8,
  },
  {
    id: "proj-5",
    title: "DAO Governance Platform",
    description:
      "Decentralized governance platform for DAOs on Stellar with voting mechanisms and proposal management.",
    tags: ["Smart Contracts", "Frontend", "Backend", "Web3"],
    status: "completed",
    createdAt: "2023-11-01T00:00:00Z",
    updatedAt: "2023-12-15T00:00:00Z",
    creator: "dao_builders",
    category: "Governance",
    milestones: 4,
    completedMilestones: 4,
  },
  {
    id: "proj-6",
    title: "Stellar Analytics Engine",
    description:
      "Advanced analytics engine for Stellar blockchain data with customizable dashboards and alerts.",
    tags: ["Analytics", "Backend", "Infrastructure", "Stellar"],
    status: "active",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-19T00:00:00Z",
    creator: "analytics_pro",
    category: "Analytics",
    milestones: 7,
    completedMilestones: 4,
  },
  {
    id: "proj-7",
    title: "Smart Contract Testing Suite",
    description:
      "Comprehensive testing framework for Stellar smart contracts with automated security audits.",
    tags: ["Testing", "Security", "Smart Contracts", "Infrastructure"],
    status: "paused",
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
    creator: "test_master",
    category: "Development Tools",
    milestones: 5,
    completedMilestones: 2,
  },
  {
    id: "proj-8",
    title: "Decentralized Identity System",
    description:
      "Self-sovereign identity solution on Stellar for secure credential management and verification.",
    tags: ["Security", "Smart Contracts", "Backend", "Web3"],
    status: "active",
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z",
    creator: "identity_dev",
    category: "Identity",
    milestones: 6,
    completedMilestones: 3,
  },
  {
    id: "proj-9",
    title: "Stellar Documentation Hub",
    description:
      "Comprehensive documentation platform with interactive tutorials and code examples for Stellar developers.",
    tags: ["Documentation", "Frontend", "Design"],
    status: "completed",
    createdAt: "2023-10-15T00:00:00Z",
    updatedAt: "2023-12-01T00:00:00Z",
    creator: "docs_team",
    category: "Education",
    milestones: 3,
    completedMilestones: 3,
  },
  {
    id: "proj-10",
    title: "Yield Aggregator Protocol",
    description:
      "Automated yield optimization protocol that finds the best returns across Stellar DeFi platforms.",
    tags: ["DeFi", "Smart Contracts", "Backend", "Analytics"],
    status: "active",
    createdAt: "2024-01-14T00:00:00Z",
    updatedAt: "2024-01-21T00:00:00Z",
    creator: "yield_hunter",
    category: "DeFi",
    milestones: 8,
    completedMilestones: 4,
  },
];
