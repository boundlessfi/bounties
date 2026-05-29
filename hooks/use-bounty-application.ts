"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { bountyKeys } from "@/lib/query/query-keys";
import { MOCK_MODEL4_MILESTONES } from "@/lib/mock/model4";
import type { BountyQuery } from "@/lib/graphql/generated";
import type { ContributorProgress, Bounty } from "@/types/bounty";

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
  applyForSlot: (params: {
    applicant: string;
    bountyId: bigint;
  }) => Promise<{ txHash: string }>;
  releasePayment: (params: {
    bountyId: bigint;
    contributor: string;
  }) => Promise<{ txHash: string }>;
  advanceMilestone: (params: {
    bountyId: bigint;
    contributor: string;
  }) => Promise<{ txHash: string }>;
  removeContributor: (params: {
    bountyId: bigint;
    contributor: string;
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
// Hook: apply for slot (BountyRegistry.apply_for_slot)
// ---------------------------------------------------------------------------

export function useApplyForSlot() {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();

  return useMutation({
    mutationFn: async ({
      bountyId,
      applicantAddress,
    }: {
      bountyId: string;
      applicantAddress: string;
    }) => {
      const client = resolveApplicationClient();
      return client.applyForSlot({
        applicant: applicantAddress,
        bountyId: toBountyIdBigInt(bountyId),
      });
    },
    onMutate: async ({ bountyId }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery & { bounty?: Partial<Bounty> }>(
        bountyKeys.detail(bountyId),
      );
      if (prev?.bounty) {
        const milestones = prev.bounty.milestones ?? MOCK_MODEL4_MILESTONES;
        const firstMilestoneId = milestones[0]?.id ?? "m1";
        const newProgress: ContributorProgress = {
          userId: session?.user?.id ?? "unknown-user",
          userName: session?.user?.name ?? "Contributor",
          userAvatarUrl:
            session?.user?.image ?? "https://github.com/shadcn.png",
          currentMilestoneId: firstMilestoneId,
        };
        const prevProgress = prev.bounty.contributorProgress ?? [];
        const updatedProgress = [...prevProgress, newProgress];
        const occupied = (prev.bounty.totalSlotsOccupied ?? 0) + 1;

        qc.setQueryData<BountyQuery & { bounty?: Partial<Bounty> }>(
          bountyKeys.detail(bountyId),
          {
            ...prev,
            bounty: {
              ...prev.bounty,
              totalSlotsOccupied: occupied,
              contributorProgress: updatedProgress,
            },
          },
        );
      }
      return { prev, bountyId };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(bountyKeys.detail(ctx.bountyId), ctx.prev);
    },
    onSettled: (_r, _e, variables) => {
      if (variables?.bountyId) {
        qc.invalidateQueries({
          queryKey: bountyKeys.detail(variables.bountyId),
        });
      }
      qc.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: advance contributor milestone
// ---------------------------------------------------------------------------

export function useAdvanceContributor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorUserName,
    }: {
      bountyId: string;
      contributorUserName: string;
    }) => {
      const client = resolveApplicationClient();
      return client.advanceMilestone({
        bountyId: toBountyIdBigInt(bountyId),
        contributor: contributorUserName,
      });
    },
    onMutate: async ({ bountyId, contributorUserName }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery & { bounty?: Partial<Bounty> }>(
        bountyKeys.detail(bountyId),
      );
      if (prev?.bounty) {
        const milestones = prev.bounty.milestones ?? MOCK_MODEL4_MILESTONES;
        const progress = prev.bounty.contributorProgress ?? [];

        const updatedProgress = progress.map((p) => {
          if (p.userName === contributorUserName) {
            const currentIndex = milestones.findIndex(
              (m) => m.id === p.currentMilestoneId,
            );
            const nextMilestone = milestones[currentIndex + 1];
            if (nextMilestone) {
              return { ...p, currentMilestoneId: nextMilestone.id };
            }
          }
          return p;
        });

        qc.setQueryData<BountyQuery & { bounty?: Partial<Bounty> }>(
          bountyKeys.detail(bountyId),
          {
            ...prev,
            bounty: {
              ...prev.bounty,
              contributorProgress: updatedProgress,
            },
          },
        );
      }
      return { prev, bountyId };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(bountyKeys.detail(ctx.bountyId), ctx.prev);
    },
    onSettled: (_r, _e, variables) => {
      if (variables?.bountyId) {
        qc.invalidateQueries({
          queryKey: bountyKeys.detail(variables.bountyId),
        });
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: remove contributor
// ---------------------------------------------------------------------------

export function useRemoveContributor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorUserName,
    }: {
      bountyId: string;
      contributorUserName: string;
    }) => {
      const client = resolveApplicationClient();
      return client.removeContributor({
        bountyId: toBountyIdBigInt(bountyId),
        contributor: contributorUserName,
      });
    },
    onMutate: async ({ bountyId, contributorUserName }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });
      const prev = qc.getQueryData<BountyQuery & { bounty?: Partial<Bounty> }>(
        bountyKeys.detail(bountyId),
      );
      if (prev?.bounty) {
        const progress = prev.bounty.contributorProgress ?? [];
        const updatedProgress = progress.filter(
          (p) => p.userName !== contributorUserName,
        );
        const occupied = Math.max(0, (prev.bounty.totalSlotsOccupied ?? 0) - 1);

        qc.setQueryData<BountyQuery & { bounty?: Partial<Bounty> }>(
          bountyKeys.detail(bountyId),
          {
            ...prev,
            bounty: {
              ...prev.bounty,
              totalSlotsOccupied: occupied,
              contributorProgress: updatedProgress,
            },
          },
        );
      }
      return { prev, bountyId };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(bountyKeys.detail(ctx.bountyId), ctx.prev);
    },
    onSettled: (_r, _e, variables) => {
      if (variables?.bountyId) {
        qc.invalidateQueries({
          queryKey: bountyKeys.detail(variables.bountyId),
        });
      }
      qc.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: release milestone payment
// ---------------------------------------------------------------------------

export function useReleaseMilestonePayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      contributorUserName,
    }: {
      bountyId: string;
      contributorUserName: string;
    }) => {
      const client = resolveApplicationClient();
      return client.releasePayment({
        bountyId: toBountyIdBigInt(bountyId),
        contributor: contributorUserName,
      });
    },
    onSettled: (_r, _e, variables) => {
      if (variables?.bountyId) {
        qc.invalidateQueries({
          queryKey: bountyKeys.detail(variables.bountyId),
        });
        qc.invalidateQueries({ queryKey: ["escrow"] });
      }
    },
  });
}
