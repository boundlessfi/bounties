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
  Clock,
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

import { BountyFieldsFragment } from "@/lib/graphql/generated";
import { StatusBadge, TypeBadge } from "./bounty-badges";
import { FcfsClaimButton } from "@/components/bounty/fcfs-claim-button";
import { CompetitionSubmission } from "@/components/bounty/competition-submission";
import { CompetitionStatus } from "@/components/bounty/competition-status";
import { authClient } from "@/lib/auth-client";
import { useCompetitionJoinState } from "@/hooks/use-competition-join-state";
import type { CancellationRecord } from "@/types/escrow";
import { useCancelBountyDialog } from "@/hooks/use-cancel-bounty-dialog";
import { useCanRaiseDispute } from "@/hooks/use-can-raise-dispute";
import type { Bounty } from "@/types/bounty";
import {
  ApplicationDialog,
  type ApplicationFormValues,
} from "@/components/bounty/application-dialog";
import { useApplyToBounty } from "@/hooks/use-bounty-application";

/** Props accept the wider intersection returned by useBountyDetail so
 * callers don't need a cast. Optional Bounty fields (maxSlots, etc.)
 * are accessible without unsafe assertions. */
type SidebarBounty = BountyFieldsFragment & Partial<Bounty>;

interface SidebarCTAProps {
  bounty: SidebarBounty;
  onCancelled?: (record: CancellationRecord) => void;
}

export function SidebarCTA({ bounty, onCancelled }: SidebarCTAProps) {
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
  const isCreator =
    (session?.user as { id?: string } | undefined)?.id === bounty.createdBy;

  const canRaiseDispute = useCanRaiseDispute(bounty);

  const canCancel =
    isCreator && (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS");

  // Fall back to _count.submissions until backend adds claimCount / maxParticipants
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

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm space-y-5">
        {/* Reward */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">
            Reward
          </span>
          <div className="text-right">
            <p className="text-2xl font-black text-primary tabular-nums leading-tight">
              {bounty.rewardAmount != null
                ? `$${bounty.rewardAmount.toLocaleString()}`
                : "TBD"}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">
              {bounty.rewardCurrency}
            </p>
          </div>
        </div>

        <Separator className="bg-gray-800/60" />

        {/* Meta */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span>Status</span>
            <StatusBadge status={bounty.status} type={bounty.type} />
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Type</span>
            <TypeBadge type={bounty.type} />
          </div>
          {bounty.type === "MULTI_WINNER_MILESTONE" &&
            (() => {
              const occupied = bounty.totalSlotsOccupied ?? 0;
              const max = bounty.maxSlots ?? 5;
              return (
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" /> Slots
                  </span>
                  <span className="font-medium text-gray-200">
                    {occupied} / {max}
                  </span>
                </div>
              );
            })()}
        </div>

        <Separator className="bg-gray-800/60" />

        {/* Competition slot count */}
        {isCompetition && (
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              Slots
            </span>
            <span className="font-medium text-gray-200">
              {claimCount}
              {maxParticipants != null ? `/${maxParticipants}` : ""} joined
            </span>
          </div>
        )}

        {isCompetition && <Separator className="bg-gray-800/60" />}

        {/* CTA */}
        {isFcfs ? (
          <FcfsClaimButton bounty={bounty} />
        ) : isCompetition ? (
          hasJoined ? (
            <Button
              className="w-full h-11 font-bold tracking-wide"
              disabled
              size="lg"
            >
              Joined ✓
            </Button>
          ) : (
            <Button
              data-testid="apply-to-bounty-btn"
              className="w-full h-11 font-bold tracking-wide"
              disabled={
                !canAct ||
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
              {canAct && !isPastDeadline ? "Join Competition" : ctaLabel()}
            </Button>
          )
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
            {ctaLabel()}
          </Button>
        )}

        {/* Helper text when locked out */}
        {isCompetition && !hasJoined && isPastDeadline && (
          <p className="flex items-center gap-1.5 text-xs text-gray-500 justify-center text-center">
            <Clock className="size-3 shrink-0" />
            Submission deadline has passed.
          </p>
        )}
        {!canAct && !isCompetition && (
          <p className="flex items-center gap-1.5 text-xs text-gray-500 justify-center text-center">
            <AlertCircle className="size-3 shrink-0" />
            This bounty is no longer accepting new submissions.
          </p>
        )}

        {/* Raise Dispute */}
        {canRaiseDispute && (
          <>
            <Separator className="bg-gray-800/60" />
            <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs h-8"
              disabled
            >
              <Gavel className="size-3 mr-2" />
              Raise a Dispute (Coming Soon)
            </Button>
          </>
        )}

        {/* Cancel Bounty */}
        {canCancel && (
          <>
            <Separator className="bg-gray-800/60" />
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isCancelling}
            >
              <XCircle className="size-4 mr-2" />
              Cancel Bounty
            </Button>
          </>
        )}

        {/* GitHub */}
        <a
          href={bounty.githubIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          <Github className="size-3" />
          View on GitHub
        </a>

        {/* Copy link */}
        <button
          type="button"
          aria-label="Copy link"
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy link
            </>
          )}
        </button>
      </div>

      {/* Competition status + submission panel */}
      {isCompetition && (
        <>
          <CompetitionStatus
            claimCount={claimCount}
            maxParticipants={maxParticipants}
            submissionCount={submissionCount}
            deadline={deadline}
            isFinalized={isFinalized}
          />
          <CompetitionSubmission
            bountyId={bounty.id}
            deadline={deadline}
            hasJoined={hasJoined}
          />
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="size-5" />
              Cancel Bounty
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-2">
              <span className="block">
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

interface MobileCTAProps {
  bounty: SidebarBounty;
  onCancelled?: (record: CancellationRecord) => void;
}

export function MobileCTA({ bounty, onCancelled }: MobileCTAProps) {
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
  const isCreator =
    (session?.user as { id?: string } | undefined)?.id === bounty.createdBy;

  const canRaiseDispute = useCanRaiseDispute(bounty);

  const canCancel =
    isCreator && (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS");

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

  const label = () => {
    if (!canAct) {
      switch (bounty.status) {
        case "IN_PROGRESS":
          return "In Progress";
        case "COMPLETED":
          return "Completed";
        default:
          return "Not Available";
      }
    }
    return "Submit to Bounty";
  };

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
