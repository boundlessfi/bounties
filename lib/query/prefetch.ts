import { QueryClient } from '@tanstack/react-query';
import type { BountyListParams } from '@/lib/api';
import { bountyListQueryOptions, bountyDetailQueryOptions } from './bounty-queries';

/**
 * Create a QueryClient for server components
 * Each request should create a new instance to avoid sharing state
 */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    });
}

/**
 * Prefetch bounty list for server components
 */
export async function prefetchBountyList(
    queryClient: QueryClient,
    params?: BountyListParams
): Promise<void> {
    await queryClient.prefetchQuery(bountyListQueryOptions(params));
}

/**
 * Prefetch single bounty for server components
 */
export async function prefetchBounty(
    queryClient: QueryClient,
    id: string
): Promise<void> {
    if (!id) return;
    await queryClient.prefetchQuery(bountyDetailQueryOptions(id));
}

/**
 * Prefetch multiple bounties by ID (for list pages with detail prefetch)
 */
export async function prefetchBounties(
    queryClient: QueryClient,
    ids: string[]
): Promise<void> {
    await Promise.all(ids.map((id) => prefetchBounty(queryClient, id)));
}
