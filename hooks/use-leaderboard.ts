import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/graphql/client';
import { 
  LeaderboardQuery,
  LeaderboardQueryVariables,
  UserLeaderboardRankQuery,
  UserLeaderboardRankQueryVariables,
  TopContributorsQuery,
  TopContributorsQueryVariables,
  LeaderboardDocument,
  UserLeaderboardRankDocument,
  TopContributorsDocument
} from '@/lib/graphql/generated';
import { LeaderboardFilters, LeaderboardResponse } from '@/types/leaderboard';

export const LEADERBOARD_KEYS = {
    all: ['leaderboard'] as const,
    lists: () => [...LEADERBOARD_KEYS.all, 'list'] as const,
    list: (filters: LeaderboardFilters) => [...LEADERBOARD_KEYS.lists(), filters] as const,
    user: (userId: string) => [...LEADERBOARD_KEYS.all, 'user', userId] as const,
    top: (count: number) => [...LEADERBOARD_KEYS.all, 'top', count] as const,
};

export const useLeaderboard = (filters: LeaderboardFilters, limit: number = 20) => {
    return useInfiniteQuery({
        queryKey: LEADERBOARD_KEYS.list(filters),
        queryFn: ({ pageParam = 1 }) => {
            return fetcher<LeaderboardQuery, LeaderboardQueryVariables>(
                LeaderboardDocument,
                { filters, pagination: { page: pageParam as number, limit } }
            )().then(data => data.leaderboard);
        },
        getNextPageParam: (lastPage: LeaderboardResponse, allPages: LeaderboardResponse[]) => {
            // Use actual loaded entries count instead of optimistic calculation
            const loadedCount = allPages.flatMap(p => p.entries).length;
            if (loadedCount < lastPage.totalCount) {
                return allPages.length + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUserRank = (userId?: string) => {
    return useQuery({
        queryKey: LEADERBOARD_KEYS.user(userId || ''),
        queryFn: () => {
            if (!userId) return null;
            return fetcher<UserLeaderboardRankQuery, UserLeaderboardRankQueryVariables>(
                UserLeaderboardRankDocument,
                { userId }
            )().then(data => data.userLeaderboardRank);
        },
        enabled: !!userId,
    });
};

export const useTopContributors = (count: number = 5) => {
    return useQuery({
        queryKey: LEADERBOARD_KEYS.top(count),
        queryFn: () => {
            return fetcher<TopContributorsQuery, TopContributorsQueryVariables>(
                TopContributorsDocument,
                { count }
            )().then(data => data.topContributors);
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
};

export const usePrefetchLeaderboardPage = () => {
    const queryClient = useQueryClient();

    return (filters: LeaderboardFilters, page: number, limit: number): Promise<void> => {
        return queryClient.prefetchInfiniteQuery({
            queryKey: LEADERBOARD_KEYS.list(filters),
            queryFn: ({ pageParam }: { pageParam: number }) => {
                return fetcher<LeaderboardQuery, LeaderboardQueryVariables>(
                    LeaderboardDocument,
                    { filters, pagination: { page: pageParam, limit } }
                )().then(data => data.leaderboard);
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage: LeaderboardResponse, allPages: LeaderboardResponse[]) => {
                const loadedCount = allPages.flatMap((p: LeaderboardResponse) => p.entries).length;
                if (loadedCount < lastPage.totalCount) {
                    return allPages.length + 1;
                }
                return undefined;
            },
            pages: page // Prefetch up to this many pages if needed
        });
    };
};
