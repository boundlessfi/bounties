import { useQueryClient, type MutateOptions } from "@tanstack/react-query";
import {
  useCreateBountyMutation,
  useUpdateBountyMutation,
  useDeleteBountyMutation,
  type CreateBountyInput,
  type UpdateBountyInput,
  type BountyFieldsFragment,
  type BountiesQuery,
  type CreateBountyMutation,
  type UpdateBountyMutation,
  type DeleteBountyMutation,
  type CreateBountyMutationVariables,
  type UpdateBountyMutationVariables,
  type DeleteBountyMutationVariables,
} from "@/lib/graphql/generated";
import { bountyKeys } from "./use-bounties";

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
      options?: MutateOptions<
        CreateBountyMutation,
        unknown,
        CreateBountyMutationVariables,
        unknown
      >,
    ) => mutation.mutate({ input }, options),
    mutateAsync: (
      input: CreateBountyInput,
      options?: MutateOptions<
        CreateBountyMutation,
        unknown,
        CreateBountyMutationVariables,
        unknown
      >,
    ) => mutation.mutateAsync({ input }, options),
  };
}

export function useUpdateBounty() {
  const queryClient = useQueryClient();
  const mutation = useUpdateBountyMutation({
    onMutate: async (variables) => {
      const { id } = variables.input;
      await queryClient.cancelQueries({ queryKey: bountyKeys.detail(id) });
      const previous = queryClient.getQueryData<BountyFieldsFragment>(
        bountyKeys.detail(id),
      );

      if (previous) {
        queryClient.setQueryData<BountyFieldsFragment>(bountyKeys.detail(id), {
          ...previous,
          ...variables.input,
          updatedAt: new Date().toISOString(),
        } as BountyFieldsFragment);
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
      options?: MutateOptions<
        UpdateBountyMutation,
        unknown,
        UpdateBountyMutationVariables,
        unknown
      >,
    ) =>
      mutation.mutate({ input: { ...data, id } as UpdateBountyInput }, options),
    mutateAsync: (
      { id, data }: { id: string; data: Omit<UpdateBountyInput, "id"> },
      options?: MutateOptions<
        UpdateBountyMutation,
        unknown,
        UpdateBountyMutationVariables,
        unknown
      >,
    ) =>
      mutation.mutateAsync(
        { input: { ...data, id } as UpdateBountyInput },
        options,
      ),
  };
}

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
      options?: MutateOptions<
        DeleteBountyMutation,
        unknown,
        DeleteBountyMutationVariables,
        unknown
      >,
    ) => mutation.mutate({ id }, options),
    mutateAsync: (
      id: string,
      options?: MutateOptions<
        DeleteBountyMutation,
        unknown,
        DeleteBountyMutationVariables,
        unknown
      >,
    ) => mutation.mutateAsync({ id }, options),
  };
}

export function useClaimBounty() {
  const queryClient = useQueryClient();
  // Claim is treated as an update the status to IN_PROGRESS
  const mutation = useUpdateBountyMutation({
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        bountyKeys.detail(variables.input.id),
        data.updateBounty,
      );
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      id: string,
      options?: MutateOptions<
        UpdateBountyMutation,
        unknown,
        UpdateBountyMutationVariables,
        unknown
      >,
    ) => mutation.mutate({ input: { id, status: "IN_PROGRESS" } }, options),
    mutateAsync: (
      id: string,
      options?: MutateOptions<
        UpdateBountyMutation,
        unknown,
        UpdateBountyMutationVariables,
        unknown
      >,
    ) =>
      mutation.mutateAsync({ input: { id, status: "IN_PROGRESS" } }, options),
  };
}
