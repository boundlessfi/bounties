"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { bountyKeys } from "@/lib/query/query-keys";

const STORAGE_KEY = "boundless:bounty-application-flow:v1";

export type ApplicationReviewStatus =
  | "pending"
  | "selected"
  | "declined"
  | "rejected";

export type SubmissionReviewStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "revision_requested";

export interface BountyApplicationProposal {
  approach: string;
  timeline: string;
  relevantExperience: string;
  portfolioLinks: string[];
}

export interface ApplicantInsights {
  reputationScore: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  completedBounties: number;
  completionRate: number;
  averageDeliveryDays: number;
}

export interface BountyApplicationRecord {
  id: string;
  bountyId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatarUrl?: string | null;
  proposal: BountyApplicationProposal;
  status: ApplicationReviewStatus;
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
  insights: ApplicantInsights;
  txHash?: string;
}

export interface BountySubmissionRecord {
  id: string;
  bountyId: string;
  contributorId: string;
  contributorName: string;
  workCid: string;
  notes?: string;
  status: SubmissionReviewStatus;
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
  pointsAwarded?: number;
  txHash?: string;
}

export interface BountyApplicationNotification {
  id: string;
  userId: string;
  kind: "selected" | "rejected" | "revision_requested" | "approved";
  message: string;
  createdAt: string;
  read: boolean;
}

interface BountyApplicationState {
  applications: BountyApplicationRecord[];
  selectedApplicantId?: string;
  escrowLocked: boolean;
  escrowLockedAt?: string;
  submission?: BountySubmissionRecord;
  notifications: BountyApplicationNotification[];
}

interface ApplicationStore {
  [bountyId: string]: BountyApplicationState;
}

interface SessionUserLike {
  id: string;
  name?: string | null;
  image?: string | null;
  organizations?: string[];
}

interface BountyLike {
  id: string;
  status: string;
  createdBy: string;
  organizationId: string;
  rewardAmount: number;
}

interface ContractResponse {
  txHash: string;
  mode: "contract" | "mock";
}

type RegistryAdapter = Partial<{
  apply: (payload: Record<string, unknown>) => Promise<unknown>;
  select_applicant: (payload: Record<string, unknown>) => Promise<unknown>;
  submit_work: (payload: Record<string, unknown>) => Promise<unknown>;
  approve_submission: (payload: Record<string, unknown>) => Promise<unknown>;
}>;

declare global {
  interface Window {
    __BOUNDLESS_BOUNTY_REGISTRY__?: RegistryAdapter;
  }
}

const EMPTY_STATE: BountyApplicationState = {
  applications: [],
  escrowLocked: false,
  notifications: [],
};

function readStore(): ApplicationStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ApplicationStore;
  } catch {
    return {};
  }
}

function writeStore(store: ApplicationStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function hashSeed(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildApplicantInsights(applicantId: string): ApplicantInsights {
  const seed = hashSeed(applicantId);
  const reputationScore = 320 + (seed % 540);

  if (reputationScore >= 760) {
    return {
      reputationScore,
      tier: "Platinum",
      completedBounties: 18 + (seed % 7),
      completionRate: 94 + (seed % 5),
      averageDeliveryDays: 3 + (seed % 3),
    };
  }

  if (reputationScore >= 620) {
    return {
      reputationScore,
      tier: "Gold",
      completedBounties: 11 + (seed % 6),
      completionRate: 89 + (seed % 6),
      averageDeliveryDays: 4 + (seed % 4),
    };
  }

  if (reputationScore >= 460) {
    return {
      reputationScore,
      tier: "Silver",
      completedBounties: 5 + (seed % 5),
      completionRate: 82 + (seed % 7),
      averageDeliveryDays: 5 + (seed % 4),
    };
  }

  return {
    reputationScore,
    tier: "Bronze",
    completedBounties: 1 + (seed % 4),
    completionRate: 74 + (seed % 8),
    averageDeliveryDays: 7 + (seed % 5),
  };
}

async function invokeRegistryMethod(
  method: keyof RegistryAdapter,
  payload: Record<string, unknown>,
): Promise<ContractResponse> {
  const adapter = window.__BOUNDLESS_BOUNTY_REGISTRY__;
  const fn = adapter?.[method];

  if (typeof fn === "function") {
    await fn(payload);
    return {
      txHash: `0x${makeId("tx").replace("tx_", "").padEnd(16, "0")}`,
      mode: "contract",
    };
  }

  await new Promise((resolve) => window.setTimeout(resolve, 350));
  return {
    txHash: `0x${makeId("mocktx").replace("mocktx_", "").padEnd(16, "0")}`,
    mode: "mock",
  };
}

function updateBountyStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  bountyId: string,
  status: string,
) {
  queryClient.setQueryData(
    bountyKeys.detail(bountyId),
    (previous: { bounty?: Record<string, unknown> } | undefined) => {
      if (!previous?.bounty) return previous;

      return {
        ...previous,
        bounty: {
          ...previous.bounty,
          status,
          updatedAt: new Date().toISOString(),
        },
      };
    },
  );
}

export function useBountyApplication({
  bounty,
  currentUser,
}: {
  bounty: BountyLike;
  currentUser?: SessionUserLike | null;
}) {
  const queryClient = useQueryClient();
  const [store, setStore] = useState<ApplicationStore>({});
  const [isReady, setIsReady] = useState(false);
  const [activeAction, setActiveAction] = useState<
    "apply" | "select" | "decline" | "submit_work" | "approve" | "revision" | null
  >(null);

  useEffect(() => {
    setStore(readStore());
    setIsReady(true);
  }, []);

  const persist = (updater: (current: ApplicationStore) => ApplicationStore) => {
    setStore((current) => {
      const next = updater(current);
      writeStore(next);
      return next;
    });
  };

  const bountyState = store[bounty.id] ?? EMPTY_STATE;
  const currentUserId = currentUser?.id ?? "";
  const isCreator =
    Boolean(currentUserId) &&
    (currentUserId === bounty.createdBy ||
      currentUser?.organizations?.includes(bounty.organizationId) === true);

  const currentUserApplication = useMemo(
    () =>
      bountyState.applications.find(
        (application) => application.applicantId === currentUserId,
      ),
    [bountyState.applications, currentUserId],
  );

  const selectedApplication = useMemo(
    () =>
      bountyState.applications.find(
        (application) => application.applicantId === bountyState.selectedApplicantId,
      ),
    [bountyState.applications, bountyState.selectedApplicantId],
  );

  const isSelectedApplicant =
    Boolean(currentUserId) && bountyState.selectedApplicantId === currentUserId;

  const notifications = useMemo(
    () =>
      bountyState.notifications.filter(
        (notification) => notification.userId === currentUserId && !notification.read,
      ),
    [bountyState.notifications, currentUserId],
  );

  const applyForBounty = async (proposal: BountyApplicationProposal) => {
    if (!currentUserId) {
      throw new Error("Please sign in before applying to a bounty.");
    }

    if (currentUserApplication) {
      throw new Error("You have already submitted an application for this bounty.");
    }

    setActiveAction("apply");
    try {
      const contract = await invokeRegistryMethod("apply", {
        applicant: currentUserId,
        bounty_id: bounty.id,
        proposal,
      });

      const record: BountyApplicationRecord = {
        id: makeId("application"),
        bountyId: bounty.id,
        applicantId: currentUserId,
        applicantName: currentUser?.name?.trim() || "Anonymous contributor",
        applicantAvatarUrl: currentUser?.image,
        proposal,
        status: "pending",
        submittedAt: new Date().toISOString(),
        insights: buildApplicantInsights(currentUserId),
        txHash: contract.txHash,
      };

      persist((current) => ({
        ...current,
        [bounty.id]: {
          ...(current[bounty.id] ?? EMPTY_STATE),
          applications: [...(current[bounty.id]?.applications ?? []), record],
          escrowLocked: current[bounty.id]?.escrowLocked ?? false,
          notifications: current[bounty.id]?.notifications ?? [],
        },
      }));

      return contract;
    } finally {
      setActiveAction(null);
    }
  };

  const selectApplicant = async (applicantId: string) => {
    if (!isCreator) {
      throw new Error("Only the bounty creator can select an applicant.");
    }

    const application = bountyState.applications.find(
      (candidate) => candidate.applicantId === applicantId,
    );
    if (!application) {
      throw new Error("Selected applicant was not found.");
    }

    setActiveAction("select");
    try {
      const contract = await invokeRegistryMethod("select_applicant", {
        creator: currentUserId,
        bounty_id: bounty.id,
        applicant: applicantId,
      });

      persist((current) => {
        const state = current[bounty.id] ?? EMPTY_STATE;
        const reviewedAt = new Date().toISOString();

        return {
          ...current,
          [bounty.id]: {
            ...state,
            selectedApplicantId: applicantId,
            escrowLocked: true,
            escrowLockedAt: reviewedAt,
            applications: state.applications.map((item) => {
              if (item.applicantId === applicantId) {
                return {
                  ...item,
                  status: "selected" as const,
                  reviewedAt,
                  feedback: "Selected for exclusive claim.",
                  txHash: contract.txHash,
                };
              }

              if (item.status === "pending") {
                return {
                  ...item,
                  status: "rejected" as const,
                  reviewedAt,
                  feedback: "Another applicant was selected for this bounty.",
                };
              }

              return item;
            }),
            notifications: [
              ...state.notifications,
              {
                id: makeId("notification"),
                userId: applicantId,
                kind: "selected",
                message:
                  "Your application was accepted. You now have the exclusive claim on this bounty.",
                createdAt: reviewedAt,
                read: false,
              },
              ...state.applications
                .filter(
                  (item) =>
                    item.applicantId !== applicantId && item.status === "pending",
                )
                .map((item) => ({
                  id: makeId("notification"),
                  userId: item.applicantId,
                  kind: "rejected" as const,
                  message:
                    "This bounty moved forward with another applicant. Thanks for applying.",
                  createdAt: reviewedAt,
                  read: false,
                })),
            ],
          },
        };
      });

      updateBountyStatus(queryClient, bounty.id, "IN_PROGRESS");
      return contract;
    } finally {
      setActiveAction(null);
    }
  };

  const declineApplicant = async (applicantId: string, feedback?: string) => {
    if (!isCreator) {
      throw new Error("Only the bounty creator can decline an applicant.");
    }

    setActiveAction("decline");
    try {
      const reviewedAt = new Date().toISOString();
      persist((current) => {
        const state = current[bounty.id] ?? EMPTY_STATE;

        return {
          ...current,
          [bounty.id]: {
            ...state,
            applications: state.applications.map((item) =>
              item.applicantId === applicantId
                ? {
                    ...item,
                    status: "declined" as const,
                    reviewedAt,
                    feedback:
                      feedback?.trim() ||
                      "Thanks for applying. We are moving ahead with other options for now.",
                  }
                : item,
            ),
            notifications: [
              ...state.notifications,
              {
                id: makeId("notification"),
                userId: applicantId,
                kind: "rejected",
                message:
                  feedback?.trim() ||
                  "Your application was declined for this bounty.",
                createdAt: reviewedAt,
                read: false,
              },
            ],
          },
        };
      });
    } finally {
      setActiveAction(null);
    }
  };

  const submitWork = async ({
    workCid,
    notes,
  }: {
    workCid: string;
    notes?: string;
  }) => {
    if (!currentUserId) {
      throw new Error("Please sign in before submitting work.");
    }

    if (!isSelectedApplicant) {
      throw new Error("Only the selected applicant can submit work.");
    }

    setActiveAction("submit_work");
    try {
      const contract = await invokeRegistryMethod("submit_work", {
        contributor: currentUserId,
        bounty_id: bounty.id,
        work_cid: workCid,
      });

      const submission: BountySubmissionRecord = {
        id: makeId("submission"),
        bountyId: bounty.id,
        contributorId: currentUserId,
        contributorName: currentUser?.name?.trim() || "Selected contributor",
        workCid,
        notes: notes?.trim() || undefined,
        status: "in_review",
        submittedAt: new Date().toISOString(),
        txHash: contract.txHash,
      };

      persist((current) => ({
        ...current,
        [bounty.id]: {
          ...(current[bounty.id] ?? EMPTY_STATE),
          applications: current[bounty.id]?.applications ?? [],
          selectedApplicantId: current[bounty.id]?.selectedApplicantId,
          escrowLocked: current[bounty.id]?.escrowLocked ?? true,
          escrowLockedAt:
            current[bounty.id]?.escrowLockedAt ?? new Date().toISOString(),
          submission,
          notifications: current[bounty.id]?.notifications ?? [],
        },
      }));

      updateBountyStatus(queryClient, bounty.id, "UNDER_REVIEW");
      return contract;
    } finally {
      setActiveAction(null);
    }
  };

  const approveSubmission = async (points: number) => {
    if (!isCreator) {
      throw new Error("Only the bounty creator can approve a submission.");
    }

    if (!bountyState.submission || !bountyState.selectedApplicantId) {
      throw new Error("There is no submission ready for approval.");
    }

    setActiveAction("approve");
    try {
      const contract = await invokeRegistryMethod("approve_submission", {
        creator: currentUserId,
        bounty_id: bounty.id,
        points,
      });

      const reviewedAt = new Date().toISOString();
      persist((current) => {
        const state = current[bounty.id] ?? EMPTY_STATE;
        const submission = state.submission;
        if (!submission) return current;

        return {
          ...current,
          [bounty.id]: {
            ...state,
            escrowLocked: false,
            submission: {
              ...submission,
              status: "approved",
              reviewedAt,
              pointsAwarded: points,
              txHash: contract.txHash,
            },
            notifications: [
              ...state.notifications,
              {
                id: makeId("notification"),
                userId: state.selectedApplicantId ?? "",
                kind: "approved",
                message:
                  "Your work was approved and escrow has been released.",
                createdAt: reviewedAt,
                read: false,
              },
            ],
          },
        };
      });

      updateBountyStatus(queryClient, bounty.id, "COMPLETED");
      return contract;
    } finally {
      setActiveAction(null);
    }
  };

  const requestRevision = async (feedback: string) => {
    if (!isCreator) {
      throw new Error("Only the bounty creator can request revisions.");
    }

    if (!bountyState.submission || !bountyState.selectedApplicantId) {
      throw new Error("There is no submission ready for review.");
    }

    setActiveAction("revision");
    try {
      const reviewedAt = new Date().toISOString();
      persist((current) => {
        const state = current[bounty.id] ?? EMPTY_STATE;
        const submission = state.submission;
        if (!submission) return current;

        return {
          ...current,
          [bounty.id]: {
            ...state,
            submission: {
              ...submission,
              status: "revision_requested",
              reviewedAt,
              feedback: feedback.trim(),
            },
            notifications: [
              ...state.notifications,
              {
                id: makeId("notification"),
                userId: state.selectedApplicantId ?? "",
                kind: "revision_requested",
                message:
                  feedback.trim() ||
                  "Revisions were requested on your submission.",
                createdAt: reviewedAt,
                read: false,
              },
            ],
          },
        };
      });

      updateBountyStatus(queryClient, bounty.id, "IN_PROGRESS");
    } finally {
      setActiveAction(null);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    persist((current) => {
      const state = current[bounty.id] ?? EMPTY_STATE;
      return {
        ...current,
        [bounty.id]: {
          ...state,
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification,
          ),
        },
      };
    });
  };

  return {
    isReady,
    isCreator,
    isSelectedApplicant,
    currentUserApplication,
    applications: bountyState.applications,
    selectedApplicantId: bountyState.selectedApplicantId,
    selectedApplication,
    submission: bountyState.submission,
    notifications,
    escrowLocked: bountyState.escrowLocked,
    escrowLockedAt: bountyState.escrowLockedAt,
    isSubmittingApplication: activeAction === "apply",
    isSelectingApplicant: activeAction === "select",
    isDecliningApplicant: activeAction === "decline",
    isSubmittingWork: activeAction === "submit_work",
    isApprovingSubmission: activeAction === "approve",
    isRequestingRevision: activeAction === "revision",
    canApply:
      Boolean(currentUserId) &&
      !isCreator &&
      !currentUserApplication &&
      !bountyState.selectedApplicantId &&
      bounty.status === "OPEN",
    applyForBounty,
    selectApplicant,
    declineApplicant,
    submitWork,
    approveSubmission,
    requestRevision,
    markNotificationRead,
  };
}
