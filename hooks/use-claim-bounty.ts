"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BountiesQuery, BountyQuery } from "@/lib/graphql/generated";
import { bountyKeys } from "@/lib/query/query-keys";

type FcfsContractClient = {
  getCredits: (address: string) => Promise<number>;
  claimBounty: (params: {
    contributor: string;
    bountyId: bigint;
  }) => Promise<{ txHash: string }>;
  approveFcfs: (params: {
    creator: string;
    bountyId: bigint;
    points: number;
  }) => Promise<{ txHash: string }>;
  unclaimBounty?: (params: {
    creator: string;
    bountyId: bigint;
    justification: string;
  }) => Promise<{ txHash: string }>;
};

type ClaimInput = {
  bountyId: string;
  contributorAddress: string;
};

type ApproveInput = {
  bountyId: string;
  creatorAddress: string;
  points: number;
};

type UnclaimInput = {
  bountyId: string;
  creatorAddress: string;
  justification: string;
};

type StructuredErrorCode =
  | "insufficient_credits"
  | "already_claimed"
  | "missing_contract_bindings"
  | "tx_failed";

export class FcfsError extends Error {
  code: StructuredErrorCode;

  constructor(code: StructuredErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Safely convert a bounty ID to a bigint.
 * If the ID is a numeric string it is converted directly;
 * otherwise it is treated as a hex-encoded UUID (dashes stripped).
 */
function toBountyIdBigInt(id: string): bigint {
  if (/^\d+$/.test(id)) return BigInt(id);
  const hex = id.replace(/-/g, "");
  if (/^[0-9a-f]+$/i.test(hex)) return BigInt(`0x${hex}`);
  throw new FcfsError(
    "tx_failed",
    `Invalid bounty ID format: "${id}" is neither numeric nor a valid UUID.`,
  );
}

function resolveContractClient(): FcfsContractClient {
  const maybeClient = (globalThis as { __fcfsContracts?: FcfsContractClient })
    .__fcfsContracts;
  if (!maybeClient) {
    throw new FcfsError(
      "missing_contract_bindings",
      "FCFS contract bindings are unavailable. Make sure #139 bindings are loaded.",
    );
  }
  return maybeClient;
}

function applyDetailOptimisticStatus(
  previous: BountyQuery | undefined,
  nextStatus: string,
  extra?: Record<string, unknown>,
) {
  if (!previous?.bounty) return previous;
  return {
    ...previous,
    bounty: {
      ...previous.bounty,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      ...extra,
    },
  };
}

function applyListOptimisticStatus(old: BountiesQuery | undefined, id: string) {
  if (!old?.bounties?.bounties) return old;
  return {
    ...old,
    bounties: {
      ...old.bounties,
      bounties: old.bounties.bounties.map((bounty) =>
        bounty.id === id
          ? {
              ...bounty,
              status: "IN_PROGRESS",
              updatedAt: new Date().toISOString(),
            }
          : bounty,
      ),
    },
  };
}

export function useClaimBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bountyId, contributorAddress }: ClaimInput) => {
      const client = resolveContractClient();
      const credits = await client.getCredits(contributorAddress);
      if (credits < 1) {
        throw new FcfsError(
          "insufficient_credits",
          "You need at least 1 Spark Credit to claim this bounty.",
        );
      }
      try {
        return await client.claimBounty({
          contributor: contributorAddress,
          bountyId: toBountyIdBigInt(bountyId),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to claim bounty.";
        if (/already/i.test(message)) {
          throw new FcfsError("already_claimed", message);
        }
        throw new FcfsError("tx_failed", message);
      }
    },
    onMutate: async ({ bountyId, contributorAddress }) => {
      await queryClient.cancelQueries({
        queryKey: bountyKeys.detail(bountyId),
      });
      await queryClient.cancelQueries({
        queryKey: bountyKeys.lists(),
      });

      const previousDetail = queryClient.getQueryData<BountyQuery>(
        bountyKeys.detail(bountyId),
      );

      const previousLists = queryClient.getQueriesData<BountiesQuery>({
        queryKey: bountyKeys.lists(),
      });

      queryClient.setQueryData<BountyQuery>(
        bountyKeys.detail(bountyId),
        applyDetailOptimisticStatus(previousDetail, "IN_PROGRESS", {
          claimedBy: contributorAddress,
        }),
      );

      queryClient.setQueriesData<BountiesQuery>(
        { queryKey: bountyKeys.lists() },
        (old) => applyListOptimisticStatus(old, bountyId),
      );

      return { previousDetail, previousLists, bountyId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          bountyKeys.detail(context.bountyId),
          context.previousDetail,
        );
      }
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: bountyKeys.detail(variables.bountyId),
      });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

export function useApproveFcfs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bountyId, creatorAddress, points }: ApproveInput) => {
      const client = resolveContractClient();
      return client.approveFcfs({
        creator: creatorAddress,
        bountyId: toBountyIdBigInt(bountyId),
        points,
      });
    },
    onMutate: async ({ bountyId }) => {
      await queryClient.cancelQueries({
        queryKey: bountyKeys.detail(bountyId),
      });
      await queryClient.cancelQueries({
        queryKey: bountyKeys.lists(),
      });

      const previousDetail = queryClient.getQueryData<BountyQuery>(
        bountyKeys.detail(bountyId),
      );
      const previousLists = queryClient.getQueriesData<BountiesQuery>({
        queryKey: bountyKeys.lists(),
      });

      queryClient.setQueryData<BountyQuery>(
        bountyKeys.detail(bountyId),
        applyDetailOptimisticStatus(previousDetail, "COMPLETED"),
      );
      return { previousDetail, previousLists, bountyId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          bountyKeys.detail(context.bountyId),
          context.previousDetail,
        );
      }
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: bountyKeys.detail(variables.bountyId),
      });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

export function useUnclaimBounty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bountyId,
      creatorAddress,
      justification,
    }: UnclaimInput) => {
      const client = resolveContractClient();
      if (!client.unclaimBounty) {
        throw new FcfsError(
          "missing_contract_bindings",
          "Unclaim is not available in the current contract bindings.",
        );
      }
      return client.unclaimBounty({
        creator: creatorAddress,
        bountyId: toBountyIdBigInt(bountyId),
        justification,
      });
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: bountyKeys.detail(variables.bountyId),
      });
      queryClient.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}
