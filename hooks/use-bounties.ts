import { useQuery } from '@tanstack/react-query';
import { bountiesApi, type Bounty, type BountyListParams, type PaginatedResponse } from '@/lib/api';

export const bountyKeys = {
    all: ['bounties'] as const,
    lists: () => [...bountyKeys.all, 'list'] as const,
    list: (params?: BountyListParams) => [...bountyKeys.lists(), params] as const,
    details: () => [...bountyKeys.all, 'detail'] as const,
    detail: (id: string) => [...bountyKeys.details(), id] as const,
};

export function useBounties(params?: BountyListParams) {
    return useQuery<PaginatedResponse<Bounty>>({
        queryKey: bountyKeys.list(params),
        queryFn: () => bountiesApi.list(params),
    });
}
