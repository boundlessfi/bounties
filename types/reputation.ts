export type ReputationTier =
    | 'NEWCOMER'
    | 'CONTRIBUTOR'
    | 'ESTABLISHED'
    | 'EXPERT'
    | 'LEGEND';

export interface ReputationBreakdown {
    features: number;
    bugs: number;
    documentation: number;
    refactoring: number;
    other: number;
}

export interface BountyStats {
    totalClaimed: number;
    totalCompleted: number;
    totalEarnings: number;
    earningsCurrency: string;
    averageCompletionTime: number; // hours
    completionRate: number;        // percentage 0-100
    currentStreak: number;
    longestStreak: number;
}

export interface BountyCompletionRecord {
    id: string;
    bountyId: string;
    bountyTitle: string;
    projectName: string;
    projectLogoUrl: string | null;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    rewardAmount: number;
    rewardCurrency: string;
    claimedAt: string;
    completedAt: string;
    completionTimeHours: number;
    maintainerRating: number | null; // 1-5 or null
    maintainerFeedback: string | null;
    pointsEarned: number;
}

export interface ContributorReputation {
    id: string;
    userId: string;
    walletAddress: string | null;
    displayName: string;
    avatarUrl: string | null;

    // Reputation Metrics
    totalScore: number;
    tier: ReputationTier;
    tierProgress: number; // 0-100 progress to next tier
    breakdown: ReputationBreakdown;

    // Activity Stats
    stats: BountyStats;

    // Expertise
    topTags: string[];
    specializations: string[];

    // Timestamps
    firstBountyAt: string | null;
    lastActiveAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RateContributorInput {
    bountyId: string;
    contributorId: string;
    rating: number; // 1-5
    feedback?: string;
}

export interface ReputationHistoryParams {
    userId: string;
    limit?: number;
    offset?: number;
}

export interface ReputationHistoryResponse {
    records: BountyCompletionRecord[];
    totalCount: number;
    hasMore: boolean;
}
