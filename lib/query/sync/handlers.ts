import { QueryClient } from "@tanstack/react-query";
import { type BountyFieldsFragment } from "@/lib/graphql/generated";
import { type PaginatedResponse } from "@/lib/api/types";
import { bountyKeys } from "@/hooks/use-bounties";

export function handleBountyCreated(
  queryClient: QueryClient,
  bounty: BountyFieldsFragment,
) {
  console.log("[Sync] Handling bounty.created:", bounty.id);

  // Update lists
  queryClient.setQueriesData<PaginatedResponse<BountyFieldsFragment>>(
    { queryKey: bountyKeys.lists() },
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: [bounty, ...oldData.data],
        pagination: {
          ...oldData.pagination,
          total: oldData.pagination.total + 1,
        },
      };
    },
  );

  // Set detail cache
  queryClient.setQueryData(bountyKeys.detail(bounty.id), bounty);
}

export function handleBountyUpdated(
  queryClient: QueryClient,
  bounty: BountyFieldsFragment,
) {
  console.log("[Sync] Handling bounty.updated:", bounty.id);

  // Update lists
  queryClient.setQueriesData<PaginatedResponse<BountyFieldsFragment>>(
    { queryKey: bountyKeys.lists() },
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((b) => (b.id === bounty.id ? bounty : b)),
      };
    },
  );

  // Update detail cache
  queryClient.setQueryData(bountyKeys.detail(bounty.id), bounty);
}

export function handleBountyDeleted(
  queryClient: QueryClient,
  bountyId: string,
) {
  console.log("[Sync] Handling bounty.deleted:", bountyId);

  // Update lists
  queryClient.setQueriesData<PaginatedResponse<BountyFieldsFragment>>(
    { queryKey: bountyKeys.lists() },
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.filter((b) => b.id !== bountyId),
        pagination: {
          ...oldData.pagination,
          total: Math.max(0, oldData.pagination.total - 1),
        },
      };
    },
  );

  // Invalidate or remove detail cache
  queryClient.removeQueries({ queryKey: bountyKeys.detail(bountyId) });
}
