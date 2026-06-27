"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { bountyKeys } from "@/lib/query/query-keys";
import { MOCK_MODEL4_MILESTONES } from "@/lib/mock/model4";
import { fetcher } from "@/lib/graphql/client";
import {
  ReviewSubmissionDocument,
  type BountyQuery,
  type DisputeReasonEnum,
  type ReviewSubmissionMutation,
  type ReviewSubmissionMutationVariables,
} from "@/lib/graphql/generated";
import type { ContributorProgress, Bounty, Milestone } from "@/types/bounty";
import { escrowKeys } from "./use-escrow";
import { EscrowService } from "@/lib/services/escrow";
import type { EscrowPool } from "@/types/escrow";
import { post } from "@/lib/api/client";

export type ExtendedBountyQuery = Omit<BountyQuery, "bounty"> & {
  bounty?: BountyQuery["bounty"] & Partial<Bounty>;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
// Hook: decline applicant
// ---------------------------------------------------------------------------

type DeclinedApplicationRecord = {
  id?: string;
  bountyId?: string;
  applicantAddress?: string;
  status?: string;
  declineReason?: string;
  declinedAt?: string;
};

type BountyWithApplications = BountyQuery & {
  bounty?: BountyQuery["bounty"] & {
    applications?: DeclinedApplicationRecord[];
  };
};

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
      return {
        bountyId,
        applicantAddress,
        reason: reason?.trim() || undefined,
        declinedAt: new Date().toISOString(),
      };
    },

    onMutate: async ({ bountyId, applicantAddress, reason }) => {
      await qc.cancelQueries({ queryKey: bountyKeys.detail(bountyId) });

      const prev = qc.getQueryData<BountyWithApplications>(
        bountyKeys.detail(bountyId),
      );

      if (prev?.bounty?.applications) {
        const declinedAt = new Date().toISOString();

        qc.setQueryData<BountyWithApplications>(bountyKeys.detail(bountyId), {
          ...prev,
          bounty: {
            ...prev.bounty,
            applications: prev.bounty.applications
              .map((application) =>
                application.applicantAddress === applicantAddress
                  ? {
                      ...application,
                      status: "DECLINED",
                      declineReason: reason?.trim() || undefined,
                      declinedAt,
                    }
                  : application,
              )
              .filter(
                (application) =>
                  application.applicantAddress !== applicantAddress,
              ),
            updatedAt: declinedAt,
          },
        });
      }

      return { prev, bountyId };
    },

    onError: (_error, _variables, context) => {
      if (context?.prev) {
        qc.setQueryData(bountyKeys.detail(context.bountyId), context.prev);
      }
    },

    onSettled: (_result, _error, variables) => {
      qc.invalidateQueries({ queryKey: bountyKeys.detail(variables.bountyId) });
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
// Hook: request revisions (reviewSubmission with status REVISION_REQUESTED)
// ---------------------------------------------------------------------------

type RequestRevisionsVars = {
  bountyId: string;
  submissionId: string;
  feedback: string;
};

type RequestRevisionsCtx = {
  prev: BountyQuery | undefined;
  bountyId: string;
};

export function useRequestRevisions() {
  const qc = useQueryClient();

  return useMutation<
    ReviewSubmissionMutation,
    Error,
    RequestRevisionsVars,
    RequestRevisionsCtx
  >({
    mutationFn: ({ submissionId, feedback }) =>
      fetcher<ReviewSubmissionMutation, ReviewSubmissionMutationVariables>(
        ReviewSubmissionDocument,
        {
          input: {
            submissionId,
            status: "REVISION_REQUESTED",
            reviewComments: feedback,
          },
        },
      )(),
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
// Static memory storage for messages
const recordedMessages: Record<
  string,
  Array<{ contributorId: string; message: string; timestamp: string }>
> = {};

export function useReleasePayment(bountyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contributorId,
      milestoneId,
    }: {
      contributorId: string;
      milestoneId: string;
    }) => {
      // Calculate proportional milestone payment amount
      const previous = queryClient.getQueryData<ExtendedBountyQuery>(
        bountyKeys.detail(bountyId),
      );
      const totalAmount = previous?.bounty?.rewardAmount ?? 100;
      const milestonesCount = previous?.bounty?.milestones?.length ?? 1;
      const amountToRelease = totalAmount / milestonesCount;

      // Persist mock escrow data update
      await EscrowService.releasePayment(bountyId, amountToRelease);
      return { contributorId, milestoneId, amountToRelease };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: escrowKeys.pool(bountyId) });
      const prevPool = queryClient.getQueryData<EscrowPool>(
        escrowKeys.pool(bountyId),
      );

      const prevBounty = queryClient.getQueryData<ExtendedBountyQuery>(
        bountyKeys.detail(bountyId),
      );
      const totalAmount = prevBounty?.bounty?.rewardAmount ?? 100;
      const milestonesCount = prevBounty?.bounty?.milestones?.length ?? 1;
      const amountToRelease = totalAmount / milestonesCount;

      if (prevPool) {
        const newReleased = Math.min(
          prevPool.totalAmount,
          prevPool.releasedAmount + amountToRelease,
        );
        const status =
          newReleased >= prevPool.totalAmount
            ? "Fully Released"
            : "Partially Released";
        queryClient.setQueryData(escrowKeys.pool(bountyId), {
          ...prevPool,
          releasedAmount: newReleased,
          status,
        });
      }
      return { prevPool };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevPool) {
        queryClient.setQueryData(escrowKeys.pool(bountyId), context.prevPool);
      }
    },
    onSuccess: () => {
      // Refresh bounty details and escrow pool data
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(bountyId) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.pool(bountyId) });
    },
  });
}

export function useAdvanceContributor(bountyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contributorId }: { contributorId: string }) => {
      await delay(1000);
      return { contributorId };
    },
    onMutate: async ({ contributorId }) => {
      await queryClient.cancelQueries({
        queryKey: bountyKeys.detail(bountyId),
      });
      const previous = queryClient.getQueryData<ExtendedBountyQuery>(
        bountyKeys.detail(bountyId),
      );

      if (previous?.bounty) {
        const contributorProgress: ContributorProgress[] =
          previous.bounty.contributorProgress || [];
        const contributorIndex = contributorProgress.findIndex(
          (c) => c.userId === contributorId,
        );

        if (contributorIndex >= 0) {
          const milestones: Milestone[] = previous.bounty.milestones || [];
          const currentMilestoneId =
            contributorProgress[contributorIndex].currentMilestoneId;
          const milestoneIndex = milestones.findIndex(
            (m) => m.id === currentMilestoneId,
          );

          if (milestoneIndex >= 0 && milestoneIndex < milestones.length - 1) {
            const nextMilestone = milestones[milestoneIndex + 1];
            const newProgress = [...contributorProgress];
            newProgress[contributorIndex] = {
              ...newProgress[contributorIndex],
              currentMilestoneId: nextMilestone.id,
            };

            queryClient.setQueryData<ExtendedBountyQuery>(
              bountyKeys.detail(bountyId),
              {
                ...previous,
                bounty: {
                  ...previous.bounty,
                  contributorProgress: newProgress,
                },
              },
            );
          }
        }
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bountyKeys.detail(bountyId), context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(bountyId) });
    },
  });
}

export function useRemoveContributor(bountyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contributorId }: { contributorId: string }) => {
      await delay(1000);
      return { contributorId };
    },
    onMutate: async ({ contributorId }) => {
      await queryClient.cancelQueries({
        queryKey: bountyKeys.detail(bountyId),
      });
      const previous = queryClient.getQueryData<ExtendedBountyQuery>(
        bountyKeys.detail(bountyId),
      );

      if (previous?.bounty) {
        const contributorProgress: ContributorProgress[] =
          previous.bounty.contributorProgress || [];

        // Decrement total slots occupied by 1
        const occupied = Math.max(
          0,
          (previous.bounty.totalSlotsOccupied ?? 1) - 1,
        );

        queryClient.setQueryData<ExtendedBountyQuery>(
          bountyKeys.detail(bountyId),
          {
            ...previous,
            bounty: {
              ...previous.bounty,
              totalSlotsOccupied: occupied,
              contributorProgress: contributorProgress.filter(
                (c) => c.userId !== contributorId,
              ),
            },
          },
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bountyKeys.detail(bountyId), context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bountyKeys.detail(bountyId) });
    },
  });
}

export function useSendMessage(bountyId: string) {
  return useMutation({
    mutationFn: async ({
      contributorId,
      message,
    }: {
      contributorId: string;
      message: string;
    }) => {
      await delay(1000);

      // Store in static memory for real message logging/recording
      if (!recordedMessages[bountyId]) {
        recordedMessages[bountyId] = [];
      }
      recordedMessages[bountyId].push({
        contributorId,
        message,
        timestamp: new Date().toISOString(),
      });

      return { contributorId, message };
    },
  });
}

// ---------------------------------------------------------------------------
// Hook: raise dispute
// ---------------------------------------------------------------------------

export interface RaiseDisputeInput {
  bountyId: string;
  reason: DisputeReasonEnum;
  description: string;
}

export interface RaiseDisputeResult {
  id: string;
  campaignId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

/**
 * Submits a new dispute for a bounty via the REST API.
 *
 * On success it returns the created dispute (including its `id`) and
 * invalidates the bounty detail query so the UI reflects the new DISPUTED
 * status immediately.
 */
export function useRaiseDispute() {
  const qc = useQueryClient();

  return useMutation<RaiseDisputeResult, Error, RaiseDisputeInput>({
    mutationFn: async ({ bountyId, reason, description }) => {
      return post<RaiseDisputeResult>("/api/disputes", {
        campaignId: bountyId,
        reason,
        description,
      });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: bountyKeys.detail(variables.bountyId) });
      qc.invalidateQueries({ queryKey: bountyKeys.lists() });
    },
  });
}
