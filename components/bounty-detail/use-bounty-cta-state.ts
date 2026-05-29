"use client";

import { useState, useMemo } from "react";
import { useCompetitionJoinState } from "@/hooks/use-competition-join-state";
import { useCanRaiseDispute } from "@/hooks/use-can-raise-dispute";
import { useCancelBountyDialog } from "@/hooks/use-cancel-bounty-dialog";
import {
  useApplyToBounty,
  useApplyForSlot,
} from "@/hooks/use-bounty-application";
import { authClient } from "@/lib/auth-client";
import type { BountyFieldsFragment } from "@/lib/graphql/generated";
import type { ApplicationFormValues } from "@/components/bounty/application-dialog";
import type { Bounty } from "@/types/bounty";
import type { CancellationRecord } from "@/types/escrow";

type SidebarBounty = BountyFieldsFragment & Partial<Bounty>;

interface UseBountyCTAStateParams {
  bounty: SidebarBounty;
  onCancelled?: (record: CancellationRecord) => void;
}

export function useBountyCTAState({
  bounty,
  onCancelled,
}: UseBountyCTAStateParams) {
  const [copied, setCopied] = useState(false);
  const { data: session } = authClient.useSession();

  // Cancel dialog state
  const {
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isCancelling,
    handleCancel,
  } = useCancelBountyDialog(bounty.id, onCancelled);

  // Competition join state
  const { walletAddress, hasJoined, isPastDeadline, joinMutation, handleJoin } =
    useCompetitionJoinState(bounty);

  // Apply to bounty mutation
  const { mutateAsync: applyToBounty } = useApplyToBounty();

  // Apply for slot mutation
  const applyForSlotMutation = useApplyForSlot();

  // Computed flags
  const canAct = bounty.status === "OPEN";
  const isFcfs = bounty.type === "FIXED_PRICE";
  const isCompetition = bounty.type === "COMPETITION";
  const isCreator = useMemo(
    () =>
      (session?.user as { id?: string } | undefined)?.id === bounty.createdBy,
    [session?.user, bounty.createdBy],
  );

  const canRaiseDispute = useCanRaiseDispute(bounty);

  const canCancel = useMemo(
    () =>
      isCreator &&
      (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS"),
    [isCreator, bounty.status],
  );

  // Prefer typed fields on Bounty; fall back to _count.submissions for backward compat.
  const claimCount = bounty.claimCount ?? bounty._count?.submissions ?? 0;
  const maxParticipants = bounty.maxParticipants ?? null;
  const deadline = bounty.bountyWindow?.endDate ?? null;
  const isFinalized = bounty.status === "COMPLETED";
  const submissionCount = bounty._count?.submissions ?? 0;

  // Handlers
  const handleApply = async (values: ApplicationFormValues) => {
    if (!walletAddress) return;
    await applyToBounty({
      bountyId: bounty.id,
      applicantAddress: walletAddress,
      proposal: JSON.stringify(values),
    });
  };

  // Multi-winner milestone states
  const isSlotsFull = useMemo(
    () => (bounty.totalSlotsOccupied ?? 0) >= (bounty.maxSlots ?? 5),
    [bounty.totalSlotsOccupied, bounty.maxSlots],
  );

  const isAlreadyJoined = useMemo(
    () =>
      bounty.contributorProgress?.some((c) => c.userId === session?.user?.id) ??
      false,
    [bounty.contributorProgress, session?.user?.id],
  );

  const applyForSlotButtonLabel = useMemo(() => {
    if (isSlotsFull) return "Slots Full";
    if (isAlreadyJoined) return "Already Joined";
    return "Apply for Slot";
  }, [isSlotsFull, isAlreadyJoined]);

  const handleApplyForSlot = async () => {
    if (!walletAddress) return;
    await applyForSlotMutation.mutateAsync({
      bountyId: bounty.id,
      applicantAddress: walletAddress,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed
    }
  };

  const ctaLabel = () => {
    if (!canAct) {
      switch (bounty.status) {
        case "IN_PROGRESS":
          return "In Progress";
        case "COMPLETED":
          return "Completed";
        case "CANCELLED":
          return "Cancelled";
        default:
          return "Not Available";
      }
    }
    return "Submit to Bounty";
  };

  return {
    // Session
    walletAddress,
    isCreator,

    // Competition join state
    hasJoined,
    isPastDeadline,
    joinMutation,
    handleJoin,

    // Apply state
    handleApply,

    // Apply for slot state
    applyForSlotMutation,
    handleApplyForSlot,
    isSlotsFull,
    isAlreadyJoined,
    applyForSlotButtonLabel,

    // Copy state
    copied,
    handleCopy,

    // Cancel dialog state
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isCancelling,
    handleCancel,

    // Flags
    canAct,
    isFcfs,
    isCompetition,
    canRaiseDispute,
    canCancel,

    // Display data
    claimCount,
    maxParticipants,
    deadline,
    isFinalized,
    submissionCount,

    // Helpers
    ctaLabel,
  };
}
