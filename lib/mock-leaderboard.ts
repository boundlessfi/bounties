import { LeaderboardContributor, ReputationTier } from "@/types/leaderboard";

const generateMockContributor = (
    id: string,
    rank: number,
    tier: ReputationTier,
    score: number
): LeaderboardContributor => ({
    id: `contributor-${id}`,
    userId: `user-${id}`,
    walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
    displayName: `Contributor ${id}`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    totalScore: score,
    tier,
    stats: {
        totalCompleted: Math.floor(Math.random() * 50) + 1,
        totalEarnings: Math.floor(Math.random() * 10000) + 100,
        earningsCurrency: "USDC",
        completionRate: 0.85 + Math.random() * 0.15,
        averageCompletionTime: Math.floor(Math.random() * 72) + 24,
        currentStreak: Math.floor(Math.random() * 5),
        longestStreak: Math.floor(Math.random() * 10) + 5,
    },
    topTags: ["DeFi", "Smart Contracts", "Frontend", "Auditing"].sort(() => 0.5 - Math.random()).slice(0, 3),
    lastActiveAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
});

export const mockLeaderboardData: LeaderboardContributor[] = [
    generateMockContributor("1", 1, ReputationTier.Legend, 15000),
    generateMockContributor("2", 2, ReputationTier.Legend, 14500),
    generateMockContributor("3", 3, ReputationTier.Expert, 12000),
    generateMockContributor("4", 4, ReputationTier.Expert, 11500),
    generateMockContributor("5", 5, ReputationTier.Established, 9000),
    generateMockContributor("6", 6, ReputationTier.Established, 8500),
    generateMockContributor("7", 7, ReputationTier.Contributor, 5000),
    generateMockContributor("8", 8, ReputationTier.Contributor, 4500),
    generateMockContributor("9", 9, ReputationTier.Newcomer, 1000),
    generateMockContributor("10", 10, ReputationTier.Newcomer, 800),
    // Generate some more for pagination testing
    ...Array.from({ length: 40 }).map((_, i) =>
        generateMockContributor(`${i + 11}`, i + 11, ReputationTier.Newcomer, 500 - i * 10)
    )
];

export const getMockLeaderboard = (
    page: number = 1,
    limit: number = 10,
    filterTier?: ReputationTier
) => {
    let filtered = [...mockLeaderboardData];

    if (filterTier) {
        filtered = filtered.filter(c => c.tier === filterTier);
    }

    const sorted = filtered.sort((a, b) => b.totalScore - a.totalScore);
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    return {
        data: paginated,
        total: filtered.length
    };
};

export const getMockUserRank = (userId: string) => {
    const index = mockLeaderboardData.findIndex(u => u.userId === userId);
    if (index === -1) return null;
    return {
        rank: index + 1,
        contributor: mockLeaderboardData[index]
    };
};
