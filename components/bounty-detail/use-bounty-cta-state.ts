"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useCompetitionJoinState } from "@/hooks/use-competition-join-state";
import { useCancelBountyDialog } from "@/hooks/use-cancel-bounty-dialog";
import { useCanRaiseDispute } from "@/hooks/use-can-raise-dispute";
import { useApplyToBounty } from "@/hooks/use-bounty-application";
import type { CancellationRecord } from "@/types/escrow";
import type { BountyFieldsFragment } from "@/lib/graphql/generated";
import type { Bounty } from "@/types/bounty";
import type { ApplicationFormValues } from "@/components/bounty/application-dialog";

export type SidebarBounty = BountyFieldsFragment & Partial<Bounty>;

export function useBountyCTAState(
  bounty: SidebarBounty,
  onCancelled?: (record: CancellationRecord) => void,
) {
  const [copied, setCopied] = useState(false);
  const { data: session } = authClient.useSession();

  const {
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isCancelling,
    handleCancel,
  } = useCancelBountyDialog(bounty.id, onCancelled);

  const canAct = bounty.status === "OPEN";
  const isFcfs = bounty.type === "FIXED_PRICE";
  const isCompetition = bounty.type === "COMPETITION";
  const isCreator = session?.user?.id === bounty.createdBy;

  const canRaiseDispute = useCanRaiseDispute(bounty);

  const canCancel =
    isCreator && (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS");

  const claimCount = bounty._count?.submissions ?? 0;
  const maxParticipants: number | null = null;
  const deadline = bounty.bountyWindow?.endDate ?? null;
  const isFinalized = bounty.status === "COMPLETED";
  const submissionCount = bounty._count?.submissions ?? 0;

  const { walletAddress, hasJoined, isPastDeadline, joinMutation, handleJoin } =
    useCompetitionJoinState(bounty);

  const { mutateAsync: applyToBounty } = useApplyToBounty();

  const handleApply = async (values: ApplicationFormValues) => {
    if (!walletAddress) return;
    await applyToBounty({
      bountyId: bounty.id,
      applicantAddress: walletAddress,
      proposal: JSON.stringify(values),
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
    copied,
    setCopied,
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelReason,
    setCancelReason,
    isCancelling,
    handleCancel,
    canAct,
    isFcfs,
    isCompetition,
    isCreator,
    canRaiseDispute,
    canCancel,
    claimCount,
    maxParticipants,
    deadline,
    isFinalized,
    submissionCount,
    walletAddress,
    hasJoined,
    isPastDeadline,
    joinMutation,
    handleJoin,
    handleApply,
    handleCopy,
    ctaLabel,
  };
}
