import { useInfiniteQuery } from '@tanstack/react-query';
import { bountiesApi, type Bounty, type BountyListParams, type PaginatedResponse } from '@/lib/api';
import { bountyKeys } from './use-bounties';

const DEFAULT_LIMIT = 20;

export function useInfiniteBounties(params?: Omit<BountyListParams, 'page'>) {
    return useInfiniteQuery<PaginatedResponse<Bounty>>({
        queryKey: [...bountyKeys.lists(), 'infinite', params] as const,
        queryFn: ({ pageParam }) =>
            bountiesApi.list({ ...params, page: pageParam as number, limit: params?.limit ?? DEFAULT_LIMIT }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.pagination;
            return page < totalPages ? page + 1 : undefined;
        },
        getPreviousPageParam: (firstPage) => {
            const { page } = firstPage.pagination;
            return page > 1 ? page - 1 : undefined;
        },
    });
}

// Helper to flatten infinite query pages
export function flattenBountyPages(
    pages: PaginatedResponse<Bounty>[] | undefined
): Bounty[] {
    return pages?.flatMap((page) => page.data) ?? [];
}
