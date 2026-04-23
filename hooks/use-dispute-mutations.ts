import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mutation,
  MutationRaiseDisputeArgs,
  MutationResolveDisputeArgs,
  DisputeReasonEnum,
  DisputeResolutionEnum,
} from "@/lib/graphql/generated";
import { fetcher } from "@/lib/graphql/client";

const RAISE_DISPUTE_MUTATION = `
  mutation RaiseDispute($input: CreateDisputeInput!) {
    raiseDispute(input: $input) {
      id
      status
      reason
      description
      createdAt
      bountyId
    }
  }
`;

const RESOLVE_DISPUTE_MUTATION = `
  mutation ResolveDispute($id: ID!, $input: AdminResolveDisputeDto!) {
    resolveDispute(id: $id, input: $input) {
      id
      status
      resolution
    }
  }
`;

export function useRaiseDisputeMutation() {
  const queryClient = useQueryClient();
  return useMutation<Mutation, Error, MutationRaiseDisputeArgs>({ // Using generated type
    mutationFn: (variables) => fetcher(RAISE_DISPUTE_MUTATION, variables)(),
    onSuccess: () => {
      // Invalidate relevant queries to refetch data after a dispute is raised
      queryClient.invalidateQueries({ queryKey: ["Bounty"] }); // Invalidate bounty details
      queryClient.invalidateQueries({ queryKey: ["disputes"] }); // Invalidate list of disputes
    },
  });
}

export function useResolveDisputeMutation() {
  const queryClient = useQueryClient();
  return useMutation<Mutation, Error, MutationResolveDisputeArgs>({ // Using generated type
    mutationFn: (variables) => fetcher(RESOLVE_DISPUTE_MUTATION, variables)(),
    onSuccess: () => {
      // Invalidate relevant queries to refetch data after a dispute is resolved
      queryClient.invalidateQueries({ queryKey: ["dispute"] }); // Invalidate specific dispute
      queryClient.invalidateQueries({ queryKey: ["Bounty"] }); // Invalidate bounty details
    },
  });
}