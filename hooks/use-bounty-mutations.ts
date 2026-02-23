import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bountiesApi,
  type Bounty,
  type CreateBountyInput,
  type UpdateBountyInput,
  type PaginatedResponse,
} from "@/lib/api";
import { bountyKeys } from "./use-bounties";

export function useCreateBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBountyInput) => bountiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

export function useUpdateBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBountyInput }) =>
      bountiesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: bountyKeys.detail(id) });
      const previous = queryClient.getQueryData<Bounty>(bountyKeys.detail(id));

      if (previous) {
        queryClient.setQueryData<Bounty>(bountyKeys.detail(id), {
          ...previous,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previous, id };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          bountyKeys.detail(context.id),
          context.previous,
        );
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

export function useDeleteBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bountiesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bountyKeys.lists() });

      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Bounty>
      >({
        queryKey: bountyKeys.lists(),
      });

      queryClient.setQueriesData<PaginatedResponse<Bounty>>(
        { queryKey: bountyKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.filter((b) => b.id !== id),
                pagination: {
                  ...old.pagination,
                  total: old.pagination.total - 1,
                },
              }
            : old,
      );

      return { previousLists };
    },
    onError: (_err, _id, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

export function useClaimBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bountiesApi.claim(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData<Bounty>(bountyKeys.detail(id), (old) => {
        if (!old) return old;

        // If the API returned a perfectly valid object with a projectName, use it
        if (data && data.projectName) {
          return data;
        }

        // Otherwise, safely patch the existing data with the claimed state
        return {
          ...old,
          status: "claimed",
          claimInfo: {
            claimedBy: {
              userId: "current-user",
              username: "You (Mock User)",
              avatarUrl: "https://github.com/shadcn.png",
            },
            claimedAt: new Date().toISOString(),
          },
        };
      });

      // Invalidate the list view so the main bounties board updates
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}
