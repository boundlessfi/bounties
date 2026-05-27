"use client";

import { XCircle, Loader2, Users, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { FcfsClaimButton } from "@/components/bounty/fcfs-claim-button";
import type { CancellationRecord } from "@/types/escrow";
import { ApplicationDialog } from "@/components/bounty/application-dialog";
import { SidebarBounty } from "./types";
import { useBountyCtaState } from "./use-bounty-cta-state";

interface MobileCTAProps {
  bounty: SidebarBounty;
  onCancelled?: (record: CancellationRecord) => void;
}

export function MobileCTA({ bounty, onCancelled }: MobileCTAProps) {
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
    label,
  } = useBountyCtaState(bounty, onCancelled);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-gray-800/60 z-20">
      {isFcfs ? (
        <FcfsClaimButton bounty={bounty} />
      ) : isCompetition ? (
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
      ) : bounty.type === "MILESTONE_BASED" && canAct && !isCreator ? (
        <div className="flex gap-2">
          <ApplicationDialog
            bountyTitle={bounty.title}
            onApply={handleApply}
            trigger={
              <Button
                className="flex-1 h-11 font-bold tracking-wide"
                size="lg"
                disabled={!walletAddress}
              >
                Apply for Bounty
              </Button>
            }
          />
          {canCancel && (
            <Button
              variant="outline"
              size="lg"
              className="h-11 border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="size-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            className="flex-1 h-11 font-bold tracking-wide"
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
          {canCancel && (
            <Button
              variant="outline"
              size="lg"
              className="h-11 border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="size-4" />
            </Button>
          )}
        </div>
      )}

      {/* Mobile Raise Dispute — coming soon */}
      {canRaiseDispute && (
        <Button
          variant="ghost"
          className="w-full mt-2 text-gray-400 text-xs h-8"
          disabled
        >
          <Gavel className="size-3 mr-2" />
          Raise a Dispute (Coming Soon)
        </Button>
      )}

      {/* Mobile Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="size-5" />
              Cancel Bounty
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the bounty and refund escrowed funds. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="mobile-cancel-reason">
              Reason <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="mobile-cancel-reason"
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-20"
              disabled={isCancelling}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Keep Bounty
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason.trim() || isCancelling}
            >
              {isCancelling && <Loader2 className="mr-2 size-4 animate-spin" />}
              Cancel & Refund
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
