import {
    ContributorReputation,
    ReputationTier,
    ReputationBreakdown,
    BountyStats
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
            other: 0
        },
        stats: {
            totalClaimed: 15,
            totalCompleted: 12,
            totalEarnings: 4500,
            earningsCurrency: "USDC",
            averageCompletionTime: 48, // hours
            completionRate: 80,
            currentStreak: 3,
            longestStreak: 5
        },
        topTags: ["React", "TypeScript", "Solidity"],
        specializations: ["Frontend", "Smart Contracts"],
        firstBountyAt: "2023-01-15T10:00:00Z",
        lastActiveAt: new Date().toISOString(),
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: new Date().toISOString(),
    }
};

export class ReputationService {
    static calculateReputationScore(
        basePoints: number,
        multipliers: { complexity?: number; speed?: number; quality?: number }
    ): number {
        let score = basePoints;
        if (multipliers.complexity) score *= multipliers.complexity;
        if (multipliers.speed) score *= multipliers.speed;
        if (multipliers.quality) score *= multipliers.quality;
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

        if (score >= 2500) { lower = 2500; upper = 5000; }
        else if (score >= 1000) { lower = 1000; upper = 2500; }
        else if (score >= 100) { lower = 100; upper = 1000; }
        else { lower = 0; upper = 100; }

        return Math.min(100, Math.max(0, ((score - lower) / (upper - lower)) * 100));
    }

    static async getReputation(userId: string): Promise<ContributorReputation | null> {
        // Simulate DB delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return MOCK_REPUTATION_DB[userId] || null;
    }

    static async getReputationByWallet(address: string): Promise<ContributorReputation | null> {
        await new Promise(resolve => setTimeout(resolve, 100));
        const user = Object.values(MOCK_REPUTATION_DB).find(u => u.walletAddress === address);
        return user || null;
    }

    static async rateContributor(
        maintainerId: string,
        contributorId: string,
        rating: number
    ): Promise<boolean> {
        console.log(`Maintainer ${maintainerId} rated ${contributorId} with ${rating}`);
        // Logic to update user score would go here
        return true;
    }
}
