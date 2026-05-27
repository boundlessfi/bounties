"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bountyKeys } from "@/lib/query/query-keys";
import type { BountyQuery } from "@/lib/graphql/generated";
import type { Bounty } from "@/types/bounty";

// ---------------------------------------------------------------------------
// Contract client shape (resolved from globalThis.__applicationContracts)
// ---------------------------------------------------------------------------

type ApplicationContractClient = {
  apply: (params: {
    applicant: string;
    bountyId: bigint;
    proposal: string;
  }) => Promise<{ txHash: string }>;
  selectApplicant: (params: {
    creator: string;
    bountyId: bigint;
    applicant: string;
  }) => Promise<{ txHash: string }>;
  submitWork: (params: {
    contributor: string;
    bountyId: bigint;
    workCid: string;
  }) => Promise<{ txHash: string }>;
  approveSubmission: (params: {
    creator: string;
    bountyId: bigint;
    points: number;
  }) => Promise<{ txHash: string }>;
  declineApplicant?: (params: {
    creator: string;
    bountyId: bigint;
    applicant: string;
    reason?: string;
  }) => Promise<{ txHash: string }>;
};

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export type ApplicationErrorCode =
  | "missing_contract_bindings"
  | "already_applied"
  | "tx_failed";

export class ApplicationError extends Error {
  code: ApplicationErrorCode;
  constructor(code: ApplicationErrorCode, message: string) {
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
  throw new ApplicationError("tx_failed", `Invalid bounty ID: "${id}"`);
}

function resolveApplicationClient(): ApplicationContractClient {
  const client = (
    globalThis as { __applicationContracts?: ApplicationContractClient }
  ).__applicationContracts;
  if (!client) {
    throw new ApplicationError(
      "missing_contract_bindings",
      "Application contract bindings unavailable. Ensure bindings are loaded.",
    );
  }
  return client;
}

// ---------------------------------------------------------------------------
// Hook: apply (BountyRegistry.apply)
// ---------------------------------------------------------------------------

export function useApplyToBounty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      applicantAddress,
      proposal,
    }: {
      bountyId: string;
      applicantAddress: string;
      proposal: string;
    }) => {
      const client = resolveApplicationClient();
      return client.apply({
        applicant: applicantAddress,
        bountyId: toBountyIdBigInt(bountyId),
        proposal,
      });
    },
    onSettled: (_r, _e, v) => {
      qc.invalidateQueries({ queryKey: bountyKeys.detail(v.bountyId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: select applicant (BountyRegistry.select_applicant)
// ---------------------------------------------------------------------------

export function useSelectApplicant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      creatorAddress,
      applicantAddress,
    }: {
      bountyId: string;
      creatorAddress: string;
      applicantAddress: string;
    }) => {
      const client = resolveApplicationClient();
      return client.selectApplicant({
        creator: creatorAddress,
        bountyId: toBountyIdBigInt(bountyId),
        applicant: applicantAddress,
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
            status: "IN_PROGRESS",
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

// ---------------------------------------------------------------------------
// Hook: submit work (BountyRegistry.submit_work)
// ---------------------------------------------------------------------------

export function useSubmitApplicationWork() {
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
      const client = resolveApplicationClient();
      return client.submitWork({
        contributor: contributorAddress,
        bountyId: toBountyIdBigInt(bountyId),
        workCid,
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
            status: "UNDER_REVIEW",
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

// ---------------------------------------------------------------------------
// Hook: approve submission (BountyRegistry.approve_submission)
// ---------------------------------------------------------------------------

export function useApproveApplicationSubmission() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      creatorAddress,
      points,
    }: {
      bountyId: string;
      creatorAddress: string;
      points: number;
    }) => {
      const client = resolveApplicationClient();
      return client.approveSubmission({
        creator: creatorAddress,
        bountyId: toBountyIdBigInt(bountyId),
        points,
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

// ---------------------------------------------------------------------------
// Hook: decline applicant
// ---------------------------------------------------------------------------

export function useDeclineApplicant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      creatorAddress,
      applicantAddress,
      reason,
    }: {
      bountyId: string;
      creatorAddress: string;
      applicantAddress: string;
      reason?: string;
    }) => {
      const client = resolveApplicationClient();
      if (client.declineApplicant) {
        return client.declineApplicant({
          creator: creatorAddress,
          bountyId: toBountyIdBigInt(bountyId),
          applicant: applicantAddress,
          reason,
        });
      } else {
        // Mock delay for UI if contract method is not yet implemented
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { txHash: "mock_tx_hash" };
      }
    },
    onMutate: async ({ bountyId, applicantAddress }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<{ bounty?: Bounty }>(
        bountyKeys.detail(bountyId),
      );
      if (prev?.bounty?.applications) {
        qc.setQueryData(bountyKeys.detail(bountyId), {
          ...prev,
          bounty: {
            ...prev.bounty,
            applications: prev.bounty.applications.filter(
              (app) => app.applicantAddress !== applicantAddress,
            ),
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
    },
  });
}
