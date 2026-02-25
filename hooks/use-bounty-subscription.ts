import { useQueryClient } from '@tanstack/react-query';
import { useGraphQLSubscription } from './use-graphql-subscription';
import {
    BOUNTY_CREATED_SUBSCRIPTION,
    BOUNTY_UPDATED_SUBSCRIPTION,
    BOUNTY_DELETED_SUBSCRIPTION,
    type BountyCreatedData,
    type BountyUpdatedData,
    type BountyDeletedData,
} from '@/lib/graphql/subscriptions';
import { bountyKeys } from '@/lib/query/query-keys';

/**
 * High-level hook that uses useGraphQLSubscription for all bounty-related events.
 * It manages React Query cache invalidation when real-time updates are received.
 */
export function useBountySubscription() {
    const queryClient = useQueryClient();

    // Handle bountyCreated: invalidate all bounty list queries
    useGraphQLSubscription<BountyCreatedData>(BOUNTY_CREATED_SUBSCRIPTION, {}, () => {
        queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    });

    // Handle bountyUpdated: invalidate the specific bounty detail query
    useGraphQLSubscription<BountyUpdatedData>(BOUNTY_UPDATED_SUBSCRIPTION, {}, (data) => {
        queryClient.invalidateQueries({ queryKey: bountyKeys.detail(data.bountyUpdated.id) });
        // Also invalidate lists to ensure consistency across the application
        queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    });

    // Handle bountyDeleted: invalidate both the bounty detail and lists
    useGraphQLSubscription<BountyDeletedData>(BOUNTY_DELETED_SUBSCRIPTION, {}, (data) => {
        queryClient.removeQueries({ queryKey: bountyKeys.detail(data.bountyDeleted.id) });
        queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    });
}
