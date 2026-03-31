"use client";

import { useState } from "react";
import {
  Github,
  Copy,
  Check,
  AlertCircle,
  XCircle,
  Loader2,
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
import { authClient } from "@/lib/auth-client";
import type { CancellationRecord } from "@/types/escrow";
import { useCancelBountyDialog } from "@/hooks/use-cancel-bounty-dialog";

interface SidebarCTAProps {
  bounty: BountyFieldsFragment;
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
  const isCreator = session?.user?.id === bounty.createdBy;
  const canCancel =
    isCreator && (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS");

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
            <StatusBadge status={bounty.status} />
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Type</span>
            <TypeBadge type={bounty.type} />
          </div>
        </div>

        <Separator className="bg-gray-800/60" />

        {/* CTA */}
        <Button
          className="w-full h-11 font-bold tracking-wide"
          disabled={!canAct}
          size="lg"
          onClick={() =>
            canAct &&
            window.open(bounty.githubIssueUrl, "_blank", "noopener,noreferrer")
          }
        >
          {ctaLabel()}
        </Button>

        {!canAct && (
          <p className="flex items-center gap-1.5 text-xs text-gray-500 justify-center text-center">
            <AlertCircle className="size-3 shrink-0" />
            This bounty is no longer accepting new submissions.
          </p>
        )}

        {/* Cancel Bounty - only for creator on open/in-progress */}
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
                className="min-h-[80px] resize-none"
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
  bounty: BountyFieldsFragment;
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
  const isCreator = session?.user?.id === bounty.createdBy;
  const canCancel =
    isCreator && (bounty.status === "OPEN" || bounty.status === "IN_PROGRESS");

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
      <div className="flex gap-2">
        <Button
          className="flex-1 h-11 font-bold tracking-wide"
          disabled={!canAct}
          size="lg"
          onClick={() =>
            canAct &&
            window.open(bounty.githubIssueUrl, "_blank", "noopener,noreferrer")
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
              className="min-h-[80px]"
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
