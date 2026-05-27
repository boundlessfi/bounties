"use client";

import { useState } from "react";
import {
  Github,
  Copy,
  Check,
  AlertCircle,
  XCircle,
  Loader2,
  Users,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { StatusBadge, TypeBadge } from "./bounty-badges";
import { FcfsClaimButton } from "@/components/bounty/fcfs-claim-button";
import { CompetitionSubmission } from "@/components/bounty/competition-submission";
import { CompetitionStatus } from "@/components/bounty/competition-status";
import type { CancellationRecord } from "@/types/escrow";
import { ApplicationDialog } from "@/components/bounty/application-dialog";
import { SidebarBounty } from "./types";
import { useBountyCtaState } from "./use-bounty-cta-state";

interface SidebarCTAProps {
  bounty: SidebarBounty;
  onCancelled?: (record: CancellationRecord) => void;
}

export function SidebarCTA({ bounty, onCancelled }: SidebarCTAProps) {
  const [copied, setCopied] = useState(false);

  const {
    cancelDialog: {
      cancelDialogOpen,
      setCancelDialogOpen,
      cancelReason,
      setCancelReason,
      isCancelling,
      handleCancel,
    },
    canAct,
    isFcfs,
    isCompetition,
    isMultiWinnerMilestone,
    isCreator,
    canRaiseDispute,
    canCancel,
    joinState: {
      walletAddress,
      hasJoined,
      isPastDeadline,
      joinMutation,
      handleJoin,
    },
    handleApply,
    handleApplyForSlot,
    isApplyingForSlot,
    isSlotFull,
    hasAppliedForSlot,
    label,
  } = useBountyCtaState(bounty, onCancelled);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background-card rounded-xl border border-gray-800/60 p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col gap-3">
          <StatusBadge status={bounty.status} />
          <TypeBadge type={bounty.type} />
        </div>

        <Separator className="bg-gray-800/60" />

        {isFcfs ? (
          <FcfsClaimButton bounty={bounty} />
        ) : isCompetition ? (
          <div className="flex flex-col gap-3">
            <Button
              data-testid="apply-to-bounty-btn"
              className="w-full h-11 font-bold tracking-wide"
              disabled={
                !canAct ||
                hasJoined ||
                isPastDeadline ||
                joinMutation.isPending ||
                !walletAddress
              }
              size="lg"
              onClick={() => void handleJoin()}
            >
              {joinMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Users className="mr-2 size-4" />
              )}
              {hasJoined
                ? "Joined ✓"
                : canAct && !isPastDeadline
                  ? "Join Competition"
                  : label()}
            </Button>
            {hasJoined && (
              <CompetitionSubmission
                bountyId={bounty.id}
                deadline={bounty.bountyWindow?.endDate}
                hasJoined={hasJoined}
              />
            )}
            <CompetitionStatus
              deadline={bounty.bountyWindow?.endDate}
              maxParticipants={bounty.maxParticipants}
              claimCount={bounty._count?.submissions || 0}
              submissionCount={bounty._count?.submissions || 0}
              isFinalized={bounty.status === "COMPLETED"}
            />
          </div>
        ) : isMultiWinnerMilestone && canAct && !isCreator ? (
          <Button
            className="w-full h-11 font-bold tracking-wide"
            disabled={
              hasAppliedForSlot ||
              isSlotFull ||
              isApplyingForSlot ||
              !walletAddress
            }
            size="lg"
            onClick={() => void handleApplyForSlot()}
          >
            {isApplyingForSlot && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            {hasAppliedForSlot
              ? "Applied ✓"
              : isSlotFull
                ? "Slots Full"
                : "Apply for Slot"}
          </Button>
        ) : bounty.type === "MILESTONE_BASED" && canAct && !isCreator ? (
          <ApplicationDialog
            bountyTitle={bounty.title}
            onApply={handleApply}
            trigger={
              <Button
                className="w-full h-11 font-bold tracking-wide"
                size="lg"
                disabled={!walletAddress}
              >
                Apply for Bounty
              </Button>
            }
          />
        ) : (
          <Button
            className="w-full h-11 font-bold tracking-wide"
            disabled={!canAct}
            size="lg"
            onClick={() =>
              canAct &&
              window.open(
                bounty.githubIssueUrl,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            {label()}
          </Button>
        )}

        {/* Dispute Button */}
        {canRaiseDispute && (
          <Button
            variant="ghost"
            className="w-full text-gray-400 hover:text-gray-200"
            disabled
          >
            <Gavel className="size-4 mr-2" />
            Raise a Dispute (Coming Soon)
          </Button>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-800/60 bg-transparent hover:bg-gray-800/40 text-gray-300 h-10"
            onClick={handleShare}
          >
            {copied ? (
              <>
                <Check className="mr-2 size-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" /> Share
              </>
            )}
          </Button>

          {bounty.githubIssueUrl && (
            <Button
              variant="outline"
              className="flex-1 border-gray-800/60 bg-transparent hover:bg-gray-800/40 text-gray-300 h-10"
              onClick={() =>
                window.open(
                  bounty.githubIssueUrl,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <Github className="mr-2 size-4" /> View
            </Button>
          )}
        </div>

        {canCancel && (
          <div className="pt-4 border-t border-red-900/20">
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="mr-2 size-4" />
              Cancel Bounty
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-background border-red-900/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400 text-xl">
              <AlertCircle className="size-5" />
              Cancel Bounty
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 space-y-4">
              <span className="block text-gray-300">
                Are you sure you want to cancel this bounty? This action will:
              </span>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  Mark the bounty as <strong>Cancelled</strong>
                </li>
                <li>Initiate a refund of escrowed funds to your wallet</li>
                <li>
                  Notify any contributors who have started or submitted work
                </li>
              </ul>
              <span className="block text-xs text-yellow-500/80 mt-2">
                ⚠️ This action cannot be undone. Any in-progress submissions
                will be invalidated.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 mt-2">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-sm font-medium">
                Reason for cancellation <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="e.g., Requirements changed, budget reallocation, issue resolved externally..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="min-h-20 resize-none"
                disabled={isCancelling}
              />
            </div>
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              disabled={isCancelling}
              onClick={() => setCancelReason("")}
            >
              Keep Bounty
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason.trim() || isCancelling}
            >
              {isCancelling && <Loader2 className="mr-2 size-4 animate-spin" />}
              Cancel Bounty & Refund
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
