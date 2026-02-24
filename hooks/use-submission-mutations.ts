import { useQueryClient, type MutateOptions } from "@tanstack/react-query";
import {
  useSubmitToBountyMutation,
  useReviewSubmissionMutation,
  useMarkSubmissionPaidMutation,
  type CreateSubmissionInput,
  type ReviewSubmissionInput,
  type SubmitToBountyMutation,
  type ReviewSubmissionMutation,
  type MarkSubmissionPaidMutation,
  type SubmitToBountyMutationVariables,
  type ReviewSubmissionMutationVariables,
  type MarkSubmissionPaidMutationVariables,
} from "@/lib/graphql/generated";
import { bountyKeys } from "@/lib/query/query-keys";

export function useSubmitToBounty() {
  const queryClient = useQueryClient();
  const mutation = useSubmitToBountyMutation({
    onSuccess: (data) => {
      const bountyId = data.submitToBounty.bountyId;
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(bountyId) });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      input: CreateSubmissionInput,
      options?: MutateOptions<
        SubmitToBountyMutation,
        unknown,
        SubmitToBountyMutationVariables,
        unknown
      >,
    ) => mutation.mutate({ input }, options),
    mutateAsync: (
      input: CreateSubmissionInput,
      options?: MutateOptions<
        SubmitToBountyMutation,
        unknown,
        SubmitToBountyMutationVariables,
        unknown
      >,
    ) => mutation.mutateAsync({ input }, options),
  };
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  const mutation = useReviewSubmissionMutation({
    onSuccess: (data) => {
      const bountyId = data.reviewSubmission.bountyId;
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(bountyId) });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      input: ReviewSubmissionInput,
      options?: MutateOptions<
        ReviewSubmissionMutation,
        unknown,
        ReviewSubmissionMutationVariables,
        unknown
      >,
    ) => mutation.mutate({ input }, options),
    mutateAsync: (
      input: ReviewSubmissionInput,
      options?: MutateOptions<
        ReviewSubmissionMutation,
        unknown,
        ReviewSubmissionMutationVariables,
        unknown
      >,
    ) => mutation.mutateAsync({ input }, options),
  };
}

export function useMarkSubmissionPaid() {
  const queryClient = useQueryClient();
  const mutation = useMarkSubmissionPaidMutation({
    onSuccess: (data) => {
      const bountyId = data.markSubmissionPaid.bountyId;
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(bountyId) });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });

  return {
    ...mutation,
    mutate: (
      {
        submissionId,
        transactionHash,
      }: { submissionId: string; transactionHash: string },
      options?: MutateOptions<
        MarkSubmissionPaidMutation,
        unknown,
        MarkSubmissionPaidMutationVariables,
        unknown
      >,
    ) => mutation.mutate({ submissionId, transactionHash }, options),
    mutateAsync: (
      {
        submissionId,
        transactionHash,
      }: { submissionId: string; transactionHash: string },
      options?: MutateOptions<
        MarkSubmissionPaidMutation,
        unknown,
        MarkSubmissionPaidMutationVariables,
        unknown
      >,
    ) => mutation.mutateAsync({ submissionId, transactionHash }, options),
  };
}
