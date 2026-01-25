import type { BountyListParams } from '@/lib/api';

/**
 * Query Key Factory for Bounties
 * 
 * Hierarchical structure enables granular cache invalidation:
 * - bountyKeys.all → invalidates everything
 * - bountyKeys.lists() → invalidates all lists, keeps details
 * - bountyKeys.list(filters) → invalidates specific filtered list
 * - bountyKeys.details() → invalidates all details, keeps lists
 * - bountyKeys.detail(id) → invalidates specific bounty
 */
export const bountyKeys = {
    all: ['bounties'] as const,
    lists: () => [...bountyKeys.all, 'list'] as const,
    list: (filters?: BountyListParams) => [...bountyKeys.lists(), filters] as const,
    infinite: (filters?: Omit<BountyListParams, 'page'>) => [...bountyKeys.lists(), 'infinite', filters] as const,
    details: () => [...bountyKeys.all, 'detail'] as const,
    detail: (id: string) => [...bountyKeys.details(), id] as const,
};

// Type helpers for query keys
export type BountyQueryKey =
    | ReturnType<typeof bountyKeys.list>
    | ReturnType<typeof bountyKeys.infinite>
    | ReturnType<typeof bountyKeys.detail>;

