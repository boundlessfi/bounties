"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bountyKeys } from "@/lib/query/query-keys";
import type { BountyQuery, DisputeReasonEnum } from "@/lib/graphql/generated";
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
  applyForSlot?: (params: {
    bountyId: bigint;
    applicant: string;
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
// Hook: apply for slot (Multi-Winner Milestone)
// ---------------------------------------------------------------------------

export function useApplyForSlot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      applicantAddress,
    }: {
      bountyId: string;
      applicantAddress: string;
      applicantName: string;
      applicantAvatarUrl: string;
    }) => {
      const client = resolveApplicationClient();
      if (client.applyForSlot) {
        return client.applyForSlot({
          applicant: applicantAddress,
          bountyId: toBountyIdBigInt(bountyId),
        });
      } else {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { txHash: "mock_tx_hash" };
      }
    },
    onMutate: async ({
      bountyId,
      applicantAddress,
      applicantName,
      applicantAvatarUrl,
    }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery>(bountyKeys.detail(bountyId));
      if (prev?.bounty) {
        const bountyData = prev.bounty as BountyQuery["bounty"] &
          Partial<Bounty>;
        const firstMilestoneId = bountyData.milestones?.[0]?.id || "m1";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        qc.setQueryData<any>(bountyKeys.detail(bountyId), {
          ...prev,
          bounty: {
            ...bountyData,
            totalSlotsOccupied: (bountyData.totalSlotsOccupied || 0) + 1,
            contributorProgress: [
              ...(bountyData.contributorProgress || []),
              {
                userId: applicantAddress,
                userName: applicantName,
                userAvatarUrl: applicantAvatarUrl,
                currentMilestoneId: firstMilestoneId,
              },
            ],
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

// ---------------------------------------------------------------------------
// Hook: advance milestone (Model 4)
// ---------------------------------------------------------------------------

export function useAdvanceMilestone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorAddress,
      nextMilestoneId,
    }: {
      bountyId: string;
      contributorAddress: string;
      nextMilestoneId: string;
    }) => {
      // Mock API call – params consumed by contract when wired
      void bountyId;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { txHash: "mock_tx_hash", contributorAddress, nextMilestoneId };
    },
    onMutate: async ({ bountyId, contributorAddress, nextMilestoneId }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery>(bountyKeys.detail(bountyId));
      if (prev?.bounty) {
        const bountyData = prev.bounty as BountyQuery["bounty"] &
          Partial<Bounty>;
        const progress = bountyData.contributorProgress || [];

        qc.setQueryData(bountyKeys.detail(bountyId), {
          ...prev,
          bounty: {
            ...bountyData,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contributorProgress: progress.map((p: any) =>
              p.userId === contributorAddress
                ? { ...p, currentMilestoneId: nextMilestoneId }
                : p,
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

// ---------------------------------------------------------------------------
// Hook: remove from slot (Model 4)
// ---------------------------------------------------------------------------

export function useRemoveFromSlot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorAddress,
    }: {
      bountyId: string;
      contributorAddress: string;
    }) => {
      // Mock API call – params consumed by contract when wired
      void bountyId;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { txHash: "mock_tx_hash", contributorAddress };
    },
    onMutate: async ({ bountyId, contributorAddress }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery>(bountyKeys.detail(bountyId));
      if (prev?.bounty) {
        const bountyData = prev.bounty as BountyQuery["bounty"] &
          Partial<Bounty>;
        const progress = bountyData.contributorProgress || [];

        qc.setQueryData(bountyKeys.detail(bountyId), {
          ...prev,
          bounty: {
            ...bountyData,
            totalSlotsOccupied: Math.max(
              0,
              (bountyData.totalSlotsOccupied || 1) - 1,
            ),
            contributorProgress: progress.filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any) => p.userId !== contributorAddress,
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

// ---------------------------------------------------------------------------
// Hook: release milestone payment (Model 4)
// ---------------------------------------------------------------------------

export function useReleaseMilestonePayment() {
  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorAddress,
    }: {
      bountyId: string;
      contributorAddress: string;
    }) => {
      // Mock API call – params consumed by contract when wired
      void bountyId;
      void contributorAddress;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { txHash: "mock_tx_hash" };
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: request revisions on a submission
// ---------------------------------------------------------------------------

export function useRequestRevisions() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      submissionId,
      feedback,
    }: {
      bountyId: string;
      submissionId: string;
      feedback: string;
    }) => {
      // Mock API call – params consumed by contract when wired
      void bountyId;
      void submissionId;
      void feedback;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { txHash: "mock_tx_hash" };
    },
    onMutate: async ({ bountyId, feedback }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery>(bountyKeys.detail(bountyId));
      if (prev?.bounty) {
        const bountyData = prev.bounty as BountyQuery["bounty"] &
          Partial<Bounty>;
        qc.setQueryData(bountyKeys.detail(bountyId), {
          ...prev,
          bounty: {
            ...bountyData,
            status: "REVISION_REQUESTED",
            latestRevisionFeedback: feedback,
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
// Hook: raise dispute
// ---------------------------------------------------------------------------

export function useRaiseDispute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      reason,
      description,
    }: {
      bountyId: string;
      reason: DisputeReasonEnum;
      description: string;
    }) => {
      // Mock API call – params consumed by backend when wired
      void bountyId;
      void reason;
      void description;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { disputeId: `dispute_${Date.now()}` };
    },
    onSettled: (_r, _e, v) => {
      if (v?.bountyId) {
        qc.invalidateQueries({ queryKey: bountyKeys.detail(v.bountyId) });
        qc.invalidateQueries({ queryKey: bountyKeys.lists() });
      }
    },
  });
}
