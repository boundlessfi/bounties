"use client";

import { useRouter } from "next/navigation";
import { useQueryClient, type MutateOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useCreateBountyMutation,
  type CreateBountyInput,
  type CreateBountyMutation,
  type CreateBountyMutationVariables,
} from "@/lib/graphql/generated";
import { bountyKeys } from "@/lib/query/query-keys";

type CreateBountyMutateOptions = MutateOptions<
  CreateBountyMutation,
  unknown,
  CreateBountyMutationVariables,
  unknown
>;

export function useCreateBounty() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useCreateBountyMutation({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
      toast.success("Bounty created successfully.");

      if (data?.createBounty?.id) {
        router.push(`/bounty/${data.createBounty.id}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Unable to create bounty. Please check your details and try again.");
    },
  });

  return {
    ...mutation,
    createBounty: (input: CreateBountyInput, options?: CreateBountyMutateOptions) =>
      mutation.mutate({ input }, options),
    createBountyAsync: (
      input: CreateBountyInput,
      options?: CreateBountyMutateOptions,
    ) => mutation.mutateAsync({ input }, options),
  };
}
