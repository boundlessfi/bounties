import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type Bounty,
  type CreateBountyInput,
  type UpdateBountyInput,
  type PaginatedResponse,
} from "@/lib/api";
import { fetcher } from "@/lib/graphql/client";
import { bountyKeys } from "@/lib/query/query-keys";

const CREATE_BOUNTY_MUTATION = `
  mutation CreateBounty($input: CreateBountyInput!) {
    createBounty(input: $input) {
      id
    }
  }
`;

const UPDATE_BOUNTY_MUTATION = `
  mutation UpdateBounty($input: UpdateBountyInput!) {
    updateBounty(input: $input) {
      id
      status
      updatedAt
    }
  }
`;

const DELETE_BOUNTY_MUTATION = `
  mutation DeleteBounty($id: ID!) {
    deleteBounty(id: $id)
  }
`;

const CLAIM_BOUNTY_MUTATION = `
  mutation ClaimBounty($id: ID!) {
    claimBounty(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

type GraphQLBountyStatus = "OPEN" | "CLAIMED" | "CLOSED";

// UI cache uses the REST status union where "claimed" represents GraphQL "CLAIMED".
const CLAIM_BOUNTY_OPTIMISTIC_STATUS: Bounty["status"] = "claimed";

type CreateBountyMutationResponse = {
  createBounty: Pick<Bounty, "id">;
};

type UpdateBountyMutationResponse = {
  updateBounty: {
    id: string;
    status: GraphQLBountyStatus;
    updatedAt: string;
  };
};

type DeleteBountyMutationResponse = {
  deleteBounty: boolean;
};

type ClaimBountyMutationResponse = {
  claimBounty: {
    id: string;
    status: GraphQLBountyStatus;
    updatedAt: string;
  };
};

type UpdateBountyMutationInput = Omit<UpdateBountyInput, "status"> & {
  id: string;
  status?: GraphQLBountyStatus;
};

async function createBountyMutation(
  input: CreateBountyInput,
): Promise<Pick<Bounty, "id">> {
  const response = await fetcher<
    CreateBountyMutationResponse,
    { input: CreateBountyInput }
  >(CREATE_BOUNTY_MUTATION, { input })();

  return response.createBounty;
}

async function updateBountyMutation(
  input: UpdateBountyMutationInput,
): Promise<UpdateBountyMutationResponse["updateBounty"]> {
  const response = await fetcher<
    UpdateBountyMutationResponse,
    { input: UpdateBountyMutationInput }
  >(UPDATE_BOUNTY_MUTATION, { input })();

  return response.updateBounty;
}

async function claimBountyMutation(
  id: string,
): Promise<ClaimBountyMutationResponse["claimBounty"]> {
  const response = await fetcher<ClaimBountyMutationResponse, { id: string }>(
    CLAIM_BOUNTY_MUTATION,
    { id },
  )();

  return response.claimBounty;
}

async function deleteBountyMutation(id: string): Promise<void> {
  const response = await fetcher<DeleteBountyMutationResponse, { id: string }>(
    DELETE_BOUNTY_MUTATION,
    { id },
  )();

  if (!response.deleteBounty) {
    throw new Error(`deleteBounty returned false for id: ${id}`);
  }
}

export function useCreateBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBountyMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

export function useUpdateBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBountyInput }) =>
      updateBountyMutation({ id, ...data }),
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
    mutationFn: deleteBountyMutation,
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
    onSettled: (_data, _err, id) => {
      if (!_err) {
        queryClient.removeQueries({ queryKey: bountyKeys.detail(id) });
      }
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

export function useClaimBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimBountyMutation,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bountyKeys.detail(id) });
      const previous = queryClient.getQueryData<Bounty>(bountyKeys.detail(id));

      if (previous) {
        queryClient.setQueryData<Bounty>(bountyKeys.detail(id), {
          ...previous,
          status: CLAIM_BOUNTY_OPTIMISTIC_STATUS,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previous, id };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          bountyKeys.detail(context.id),
          context.previous,
        );
      }
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}
