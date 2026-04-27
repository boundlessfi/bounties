"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bountyKeys } from "@/lib/query/query-keys";
import type { BountyQuery } from "@/lib/graphql/generated";

// ---------------------------------------------------------------------------
// Contract client shape (resolved from globalThis.__contestContracts)
// ---------------------------------------------------------------------------

type ContestContractClient = {
  claimBounty: (params: {
    contributor: string;
    bountyId: bigint;
  }) => Promise<{ txHash: string }>;
  submitWork: (params: {
    contributor: string;
    bountyId: bigint;
    workCid: string;
  }) => Promise<{ txHash: string }>;
  approveContestWinner: (params: {
    creator: string;
    bountyId: bigint;
    winner: string;
    payoutAmount: bigint;
    points: number;
  }) => Promise<{ txHash: string }>;
  finalizeContest: (params: {
    creator: string;
    bountyId: bigint;
  }) => Promise<{ txHash: string }>;
};

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export type ContestErrorCode =
  | "missing_contract_bindings"
  | "slots_full"
  | "already_joined"
  | "deadline_passed"
  | "tx_failed";

export class ContestError extends Error {
  code: ContestErrorCode;
  constructor(code: ContestErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBountyIdBigInt(id: string): bigint {
  if (/^\d+$/.test(id)) return BigInt(id);
  const hex = id.replace(/-/g, "");
  if (/^[0-9a-f]+$/i.test(hex)) return BigInt(`0x${hex}`);
  throw new ContestError("tx_failed", `Invalid bounty ID: "${id}"`);
}

function resolveContestClient(): ContestContractClient {
  const client = (globalThis as { __contestContracts?: ContestContractClient })
    .__contestContracts;
  if (!client) {
    throw new ContestError(
      "missing_contract_bindings",
      "Contest contract bindings unavailable. Ensure #139 bindings are loaded.",
    );
  }
  return client;
}

// ---------------------------------------------------------------------------
// Hook: join competition (claim_bounty for Contest type)
// NOTE: Does NOT optimistically set status to IN_PROGRESS — competition
// bounties remain OPEN while multiple participants join.
// ---------------------------------------------------------------------------

export function useJoinCompetition() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorAddress,
    }: {
      bountyId: string;
      contributorAddress: string;
    }) => {
      const client = resolveContestClient();
      return client.claimBounty({
        contributor: contributorAddress,
        bountyId: toBountyIdBigInt(bountyId),
      });
    },
    onSettled: (_r, _e, v) => {
      // Invalidate to get fresh participant list from backend
      qc.invalidateQueries({ queryKey: bountyKeys.detail(v.bountyId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: submit work (submit_work)
// ---------------------------------------------------------------------------

export function useSubmitContestWork() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorAddress,
      workCid,
    }: {
      bountyId: string;
      contributorAddress: string;
      workCid: string;
    }) => {
      const client = resolveContestClient();
      return client.submitWork({
        contributor: contributorAddress,
        bountyId: toBountyIdBigInt(bountyId),
        workCid,
      });
    },
    onSettled: (_r, _e, v) => {
      qc.invalidateQueries({ queryKey: bountyKeys.detail(v.bountyId) });
      qc.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: approve contest winner (approve_contest_winner)
// ---------------------------------------------------------------------------

export function useApproveContestWinner() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      creatorAddress,
      winner,
      payoutAmount,
      points,
    }: {
      bountyId: string;
      creatorAddress: string;
      winner: string;
      payoutAmount: bigint;
      points: number;
    }) => {
      const client = resolveContestClient();
      return client.approveContestWinner({
        creator: creatorAddress,
        bountyId: toBountyIdBigInt(bountyId),
        winner,
        payoutAmount,
        points,
      });
    },
    onSettled: (_r, _e, v) => {
      qc.invalidateQueries({ queryKey: bountyKeys.detail(v.bountyId) });
      qc.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: finalize contest (finalize_contest)
// ---------------------------------------------------------------------------

export function useFinalizeContest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      creatorAddress,
    }: {
      bountyId: string;
      creatorAddress: string;
    }) => {
      const client = resolveContestClient();
      return client.finalizeContest({
        creator: creatorAddress,
        bountyId: toBountyIdBigInt(bountyId),
      });
    },
    onMutate: async ({ bountyId }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery>(bountyKeys.detail(bountyId));
      if (prev?.bounty) {
        qc.setQueryData<BountyQuery>(bountyKeys.detail(bountyId), {
          ...prev,
          bounty: {
            ...prev.bounty,
            status: "COMPLETED",
            updatedAt: new Date().toISOString(),
          },
        });
      }
      return { prev, bountyId };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(bountyKeys.detail(ctx.bountyId), ctx.prev);
    },
    onSettled: (_r, _e, v) => {
      qc.invalidateQueries({ queryKey: bountyKeys.detail(v.bountyId) });
      qc.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}
