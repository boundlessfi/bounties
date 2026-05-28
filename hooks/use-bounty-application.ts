"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bountyKeys } from "@/lib/query/query-keys";
import type { BountyQuery } from "@/lib/graphql/generated";

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
    bountyId: bigint;
    applicant: string;
    reason?: string;
  }) => Promise<{ txHash?: string }>;
};

type CachedApplication = {
  applicantAddress?: string;
  status?: string;
  declinedReason?: string;
  declinedAt?: string;
};

type BountyQueryWithApplications = BountyQuery & {
  bounty?: BountyQuery["bounty"] & {
    applications?: CachedApplication[];
  };
};

type DeclinedApplicationRecord = {
  bountyId: string;
  applicantAddress: string;
  reason?: string;
  declinedAt: string;
};

const declinedApplicationsKey = (bountyId: string) =>
  ["bounty", bountyId, "declined-applications"] as const;

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
// Hook: decline applicant
// ---------------------------------------------------------------------------

export function useDeclineApplicant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      applicantAddress,
      reason,
    }: {
      bountyId: string;
      applicantAddress: string;
      reason?: string;
    }) => {
      const client = (
        globalThis as { __applicationContracts?: ApplicationContractClient }
      ).__applicationContracts;
      const trimmedReason = reason?.trim() || undefined;

      if (client?.declineApplicant) {
        return client.declineApplicant({
          bountyId: toBountyIdBigInt(bountyId),
          applicant: applicantAddress,
          reason: trimmedReason,
        });
      }

      return {
        applicantAddress,
        bountyId,
        reason: trimmedReason,
      };
    },
    onMutate: async ({ bountyId, applicantAddress, reason }) => {
      const detailKey = bountyKeys.detail(bountyId);
      const declinedKey = declinedApplicationsKey(bountyId);
      await qc.cancelQueries({ queryKey: detailKey });

      const prevDetail =
        qc.getQueryData<BountyQueryWithApplications>(detailKey);
      const prevDeclined =
        qc.getQueryData<DeclinedApplicationRecord[]>(declinedKey) ?? [];
      const declinedAt = new Date().toISOString();
      const trimmedReason = reason?.trim() || undefined;

      qc.setQueryData<DeclinedApplicationRecord[]>(declinedKey, [
        ...prevDeclined.filter(
          (item) => item.applicantAddress !== applicantAddress,
        ),
        {
          bountyId,
          applicantAddress,
          reason: trimmedReason,
          declinedAt,
        },
      ]);

      if (prevDetail?.bounty?.applications) {
        qc.setQueryData<BountyQueryWithApplications>(detailKey, {
          ...prevDetail,
          bounty: {
            ...prevDetail.bounty,
            applications: prevDetail.bounty.applications
              .map((application) =>
                application.applicantAddress === applicantAddress
                  ? {
                      ...application,
                      status: "DECLINED",
                      declinedReason: trimmedReason,
                      declinedAt,
                    }
                  : application,
              )
              .filter(
                (application) =>
                  application.applicantAddress !== applicantAddress,
              ),
          },
        });
      }

      return { bountyId, detailKey, declinedKey, prevDetail, prevDeclined };
    },
    onError: (_e, _v, ctx) => {
      if (!ctx) return;
      qc.setQueryData(ctx.detailKey, ctx.prevDetail);
      qc.setQueryData(ctx.declinedKey, ctx.prevDeclined);
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
