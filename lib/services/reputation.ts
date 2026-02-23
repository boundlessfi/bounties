import {
  ContributorReputation,
  ReputationTier,
  ReputationHistoryResponse,
  BountyCompletionRecord,
} from "@/types/reputation";

// Mock Data Store (In-memory for prototype)
const MOCK_REPUTATION_DB: Record<string, ContributorReputation> = {
  "user-1": {
    id: "rep-1",
    userId: "user-1",
    walletAddress: "0x123...abc",
    displayName: "Alice Dev",
    avatarUrl: "https://github.com/shadcn.png",
    totalScore: 1250,
    tier: "ESTABLISHED",
    tierProgress: 65,
    breakdown: {
      features: 800,
      bugs: 300,
      documentation: 50,
      refactoring: 100,
      other: 0,
    },
    stats: {
      totalClaimed: 15,
      totalCompleted: 12,
      totalEarnings: 4500,
      earningsCurrency: "USDC",
      averageCompletionTime: 48, // hours
      completionRate: 80,
      currentStreak: 3,
      longestStreak: 5,
    },
    topTags: ["React", "TypeScript", "Solidity"],
    specializations: ["Frontend", "Smart Contracts"],
    firstBountyAt: "2023-01-15T10:00:00Z",
    lastActiveAt: new Date().toISOString(),
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
};

export class ReputationService {
  static calculateReputationScore(
    basePoints: number,
    multipliers: { complexity?: number; speed?: number; quality?: number },
  ): number {
    let score = basePoints;
    if (Number.isFinite(multipliers.complexity))
      score *= multipliers.complexity!;
    if (Number.isFinite(multipliers.speed)) score *= multipliers.speed!;
    if (Number.isFinite(multipliers.quality)) score *= multipliers.quality!;
    return Math.round(score);
  }

  static getTierFromScore(score: number): ReputationTier {
    if (score >= 5000) return "LEGEND";
    if (score >= 2500) return "EXPERT";
    if (score >= 1000) return "ESTABLISHED";
    if (score >= 100) return "CONTRIBUTOR";
    return "NEWCOMER";
  }

  static calculateTierProgress(score: number): number {
    let lower = 0;
    let upper = 100;

    if (score >= 5000) return 100; // Legend (Max)

    if (score >= 2500) {
      lower = 2500;
      upper = 5000;
    } else if (score >= 1000) {
      lower = 1000;
      upper = 2500;
    } else if (score >= 100) {
      lower = 100;
      upper = 1000;
    } else {
      lower = 0;
      upper = 100;
    }

    return Math.min(
      100,
      Math.max(0, ((score - lower) / (upper - lower)) * 100),
    );
  }

  static async getReputation(
    userId: string,
  ): Promise<ContributorReputation | null> {
    // Simulate DB delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_REPUTATION_DB[userId] || null;
  }

  static async getCompletionHistory(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<ReputationHistoryResponse> {
    // Simulate DB delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // For prototype purposes return mocked completion records derived from the user's reputation
    const user = MOCK_REPUTATION_DB[userId];
    if (!user) return { records: [], totalCount: 0, hasMore: false };

    // Create some fake completion records if none exist
    const sample: BountyCompletionRecord[] = Array.from({ length: 25 }).map(
      (_, i) => ({
        id: `rec-${i + 1}`,
        bountyId: `bounty-${i + 1}`,
        bountyTitle: `Sample Bounty ${i + 1}`,
        projectName: `Project ${(i % 5) + 1}`,
        projectLogoUrl: null,
        difficulty:
          i % 3 === 0 ? "BEGINNER" : i % 3 === 1 ? "INTERMEDIATE" : "ADVANCED",
        rewardAmount: 100 * (i + 1),
        rewardCurrency: "USDC",
        claimedAt: new Date(
          Date.now() - (i + 10) * 24 * 3600 * 1000,
        ).toISOString(),
        completedAt: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
        completionTimeHours: 24 + i,
        maintainerRating: i % 2 === 0 ? 5 : null,
        maintainerFeedback: i % 2 === 0 ? "Great work" : null,
        pointsEarned: 10 + i,
      }),
    );

    const totalCount = sample.length;
    const records = sample.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    return { records, totalCount, hasMore };
  }

  static async getReputationByWallet(
    address: string,
  ): Promise<ContributorReputation | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const normalizedAddress = address.toLowerCase();
    const user = Object.values(MOCK_REPUTATION_DB).find(
      (u) => u.walletAddress?.toLowerCase() === normalizedAddress,
    );
    return user || null;
  }

  static async rateContributor(
    maintainerId: string,
    contributorId: string,
    rating: number,
  ): Promise<boolean> {
    console.log(
      `Maintainer ${maintainerId} rated ${contributorId} with ${rating}`,
    );
    // Logic to update user score would go here
    return true;
  }

  static async linkWallet(
    userId: string,
    address: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Simulate DB update
    await new Promise((resolve) => setTimeout(resolve, 100));

    const normalizedAddress = address.toLowerCase();

    // 1. Check for duplicates (Collision check)
    const existingOwner = Object.values(MOCK_REPUTATION_DB).find(
      (u) => u.walletAddress?.toLowerCase() === normalizedAddress,
    );

    if (existingOwner) {
      if (existingOwner.userId === userId) return { success: true }; // Already linked to this user
      return { success: false, error: "Wallet already linked to another user" };
    }

    const user = MOCK_REPUTATION_DB[userId];
    if (user) {
      user.walletAddress = normalizedAddress;
      return { success: true };
    }
    return { success: false, error: "User not found" };
  }
}
