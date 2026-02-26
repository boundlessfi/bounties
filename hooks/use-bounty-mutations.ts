import { useQueryClient, type MutateOptions } from "@tanstack/react-query";
import {
  useCreateBountyMutation,
  useUpdateBountyMutation,
  useDeleteBountyMutation,
  type CreateBountyInput,
  type UpdateBountyInput,
  type BountyQuery,
  type BountiesQuery,
  type CreateBountyMutation,
  type UpdateBountyMutation,
  type DeleteBountyMutation,
  type CreateBountyMutationVariables,
  type UpdateBountyMutationVariables,
  type DeleteBountyMutationVariables,
} from "@/lib/graphql/generated";
import { bountyKeys } from "@/lib/query/query-keys";

/**
 * Type aliases for cleaner mutation option signatures
 */
type CreateBountyMutateOptions = MutateOptions<
  CreateBountyMutation,
  unknown,
  CreateBountyMutationVariables,
  unknown
>;

type UpdateBountyMutateOptions = MutateOptions<
  UpdateBountyMutation,
  unknown,
  UpdateBountyMutationVariables,
  unknown
>;

type DeleteBountyMutateOptions = MutateOptions<
  DeleteBountyMutation,
  unknown,
  DeleteBountyMutationVariables,
  unknown
>;

/**
 * Hook to create a new bounty
 * Handles GraphQL mutation and cache invalidation for bounty lists
 *
 * @returns Mutation object with mutate/mutateAsync methods
 * @example
 * const { mutate, isPending } = useCreateBounty();
 * mutate({ title: "Fix bug", description: "...", ... });
 */
export function useCreateBounty() {
  const queryClient = useQueryClient();
  const mutation = useCreateBountyMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      input: CreateBountyInput,
      options?: CreateBountyMutateOptions,
    ) => mutation.mutate({ input }, options),
    mutateAsync: (
      input: CreateBountyInput,
      options?: CreateBountyMutateOptions,
    ) => mutation.mutateAsync({ input }, options),
  };
}

/**
 * Hook to update an existing bounty
 * Implements optimistic updates with rollback on error
 * Filters undefined/null values to send only changed fields
 *
 * @returns Mutation object with mutate/mutateAsync methods
 * @example
 * const { mutate } = useUpdateBounty();
 * mutate({ id: "123", data: { status: "CLOSED" } });
 */
export function useUpdateBounty() {
  const queryClient = useQueryClient();
  const mutation = useUpdateBountyMutation({
    onMutate: async (variables) => {
      const { id } = variables.input;
      await queryClient.cancelQueries({ queryKey: bountyKeys.detail(id) });
      const previous = queryClient.getQueryData<BountyQuery>(
        bountyKeys.detail(id),
      );

      if (previous?.bounty) {
        const optimisticInput = Object.fromEntries(
          Object.entries(variables.input).filter(
            ([, value]) => value !== undefined && value !== null,
          ),
        ) as Partial<BountyQuery["bounty"]>;

        queryClient.setQueryData<BountyQuery>(bountyKeys.detail(id), {
          ...previous,
          bounty: {
            ...previous.bounty,
            ...optimisticInput,
            updatedAt: new Date().toISOString(),
          },
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
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: bountyKeys.detail(variables.input.id),
      });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      { id, data }: { id: string; data: Omit<UpdateBountyInput, "id"> },
      options?: UpdateBountyMutateOptions,
    ) =>
      mutation.mutate({ input: { ...data, id } as UpdateBountyInput }, options),
    mutateAsync: (
      { id, data }: { id: string; data: Omit<UpdateBountyInput, "id"> },
      options?: UpdateBountyMutateOptions,
    ) =>
      mutation.mutateAsync(
        { input: { ...data, id } as UpdateBountyInput },
        options,
      ),
  };
}

/**
 * Hook to delete a bounty
 * Removes the bounty from list cache optimistically
 * Updates total count on deletion
 *
 * @returns Mutation object with mutate/mutateAsync methods
 * @example
 * const { mutate } = useDeleteBounty();
 * mutate("bounty-id-123");
 */
export function useDeleteBounty() {
  const queryClient = useQueryClient();
  const mutation = useDeleteBountyMutation({
    onMutate: async (variables) => {
      const { id } = variables;
      await queryClient.cancelQueries({ queryKey: bountyKeys.lists() });

      const previousLists = queryClient.getQueriesData<BountiesQuery>({
        queryKey: bountyKeys.lists(),
      });

      queryClient.setQueriesData<BountiesQuery>(
        { queryKey: bountyKeys.lists() },
        (old) =>
          old
            ? {
                ...old,
                bounties: {
                  ...old.bounties,
                  bounties: old.bounties.bounties.filter((b) => b.id !== id),
                  total: old.bounties.total - 1,
                },
              }
            : old,
      );

      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      id: string,
      options?: DeleteBountyMutateOptions,
    ) => mutation.mutate({ id }, options),
    mutateAsync: (
      id: string,
      options?: DeleteBountyMutateOptions,
    ) => mutation.mutateAsync({ id }, options),
  };
}

/**
 * Hook to claim a bounty
 * Implemented as updateBounty mutation with status: "IN_PROGRESS"
 * Awaiting backend implementation of dedicated claimBounty mutation
 *
 * @returns Mutation object with mutate/mutateAsync methods
 * @example
 * const { mutate } = useClaimBounty();
 * mutate("bounty-id-123");
 */
export function useClaimBounty() {
  const queryClient = useQueryClient();
  // Claim is treated as updating the bounty status to IN_PROGRESS
  const mutation = useUpdateBountyMutation({
    onSuccess: (data, variables) => {
      queryClient.setQueryData<BountyQuery>(
        bountyKeys.detail(variables.input.id),
        { bounty: data.updateBounty },
      );
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      id: string,
      options?: UpdateBountyMutateOptions,
    ) => mutation.mutate({ input: { id, status: "IN_PROGRESS" } }, options),
    mutateAsync: (
      id: string,
      options?: UpdateBountyMutateOptions,
    ) =>
      mutation.mutateAsync({ input: { id, status: "IN_PROGRESS" } }, options),
  };
}
