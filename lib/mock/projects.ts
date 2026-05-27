import type { Project } from "@/types/project";

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

export const makeMockProject = (overrides?: Partial<Project>): Project => ({
  ...mockProjects[0],
  ...overrides,
});
