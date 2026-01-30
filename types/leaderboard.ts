export type ReputationTier =
    | 'NEWCOMER'
    | 'CONTRIBUTOR'
    | 'ESTABLISHED'
    | 'EXPERT'
    | 'LEGEND';

export type LeaderboardTimeframe =
    | 'ALL_TIME'
    | 'THIS_MONTH'
    | 'THIS_WEEK';

export interface ContributorStats {
    totalCompleted: number;
    totalEarnings: number;
    earningsCurrency: string;
    completionRate: number;
    averageCompletionTime: number;
    currentStreak: number;
    longestStreak: number;
    nextTierThreshold?: number;
    currentTierPoints?: number;
}

export interface LeaderboardContributor {
    id: string;
    userId: string;
    walletAddress: string | null;
    displayName: string;
    avatarUrl: string | null;
    totalScore: number;
    tier: ReputationTier;
    stats: ContributorStats;
    topTags: string[];
    lastActiveAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    previousRank: number | null;
    rankChange: number | null;
    contributor: LeaderboardContributor;
}

export interface LeaderboardResponse {
    entries: LeaderboardEntry[];
    totalCount: number;
    currentUserRank: number | null;
    lastUpdatedAt: string;
}

export interface LeaderboardFilters {
    timeframe: LeaderboardTimeframe;
    tier?: ReputationTier;
    tags?: string[];
}

export interface LeaderboardPagination {
    page: number;
    limit: number;
}
