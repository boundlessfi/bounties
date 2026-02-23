"use client";

import { useMemo, useState } from "react";
import { RatingModal } from "../rating/rating-modal";
import { useClaimBounty } from "@/hooks/use-bounty-mutations";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  BountyFieldsFragment,
  BountySubmissionType,
} from "@/lib/graphql/generated";
import { Github, Link2, Clock, Calendar, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface BountySidebarProps {
  bounty: BountyFieldsFragment & {
    submissions?:
      | (Pick<BountySubmissionType, "submittedBy"> & {
          submittedByUser?: { name?: string | null } | null;
        })[]
      | null;
  };
}

export function BountySidebar({ bounty }: BountySidebarProps) {
  const [copied, setCopied] = useState(false);
  const claimBounty = useClaimBounty();
  const [loading, setLoading] = useState(false);

  // Mock maintainer check for now - in real app this comes from auth context
  const IS_MAINTAINER = process.env.NEXT_PUBLIC_MOCK_MAINTAINER === "true";

  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_MOCK_MAINTAINER === "true"
  ) {
    console.warn(
      "DEV: Mock maintainer enabled in components/bounty/bounty-sidebar.tsx — do NOT enable in production",
    );
  }

  const createdTimeAgo = useMemo(
    () => formatDistanceToNow(new Date(bounty.createdAt), { addSuffix: true }),
    [bounty.createdAt],
  );

  const updatedTimeAgo = useMemo(
    () => formatDistanceToNow(new Date(bounty.updatedAt), { addSuffix: true }),
    [bounty.updatedAt],
  );

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy link to clipboard:", error);
    }
  };

  // Generic action helper removed — unused. Keep specific handlers like `handleClaim`.

  const handleClaim = async (): Promise<boolean> => {
    try {
      await claimBounty.mutateAsync(bounty.id);
      toast("Action completed successfully");
      return true;
    } catch (error) {
      console.error("Claim error:", error);
      const message = error instanceof Error ? error.message : "Action failed";
      toast.error(message);
      return false;
    }
  };

  // Rating modal state
  const [showRating, setShowRating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastRating, setLastRating] = useState<number | null>(null);
  const [reputationGain, setReputationGain] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{
    id: string;
    name: string;
    reputation: number;
  } | null>(null);

  const handleMarkCompleted = async () => {
    if (!IS_MAINTAINER) {
      alert("Only maintainers can mark as completed.");
      return;
    }
    setLoading(true);
    // Simulate completion API call
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      // Determine the contributor to rate: prefer submission's submitter
      const submission =
        bounty.submissions && bounty.submissions.length > 0
          ? bounty.submissions[0]
          : null;
      const contributorId = submission?.submittedBy ?? bounty.createdBy ?? "";
      const contributorName =
        submission?.submittedByUser?.name ?? "Contributor";
      setRatingTarget({
        id: contributorId,
        name: contributorName,
        reputation: 100 + (reputationGain || 0),
      });
      setShowRating(true);
    }, 1000);
  };

  const handleSubmitRating = async (rating: number, feedback: string) => {
    if (hasRated) {
      alert("You have already rated this contributor.");
      return;
    }
    if (!IS_MAINTAINER) {
      alert("Only maintainers can rate contributors.");
      return;
    }
    if (!completed) {
      alert("Bounty must be marked as completed before rating.");
      return;
    }
    // Simulate API call to reputation endpoint and calculate points
    await new Promise((res) => setTimeout(res, 1000));
    void feedback;
    setLastRating(rating);
    setReputationGain(rating * 10);
    setHasRated(true);
    setShowRating(false);
    toast.success("Rating submitted", {
      description: `You rated the contributor ${rating} star${rating > 1 ? "s" : ""}.`,
    });
  };

  const renderActionButton = () => {
    if (bounty.status === "IN_PROGRESS" && IS_MAINTAINER && !completed) {
      return (
        <Button
          onClick={handleMarkCompleted}
          disabled={loading}
          className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Mark as Completed
        </Button>
      );
    }
    if (bounty.status !== "OPEN") {
      const labels: Record<string, string> = {
        IN_PROGRESS: "In Progress",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
        DRAFT: "Draft",
        SUBMITTED: "Submitted",
        UNDER_REVIEW: "Under Review",
        DISPUTED: "Disputed",
      };
      return (
        <Button disabled className="w-full gap-2 cursor-not-allowed">
          {labels[bounty.status] || "Not Available"}
        </Button>
      );
    }

    return (
      <Button
        onClick={() => void handleClaim()}
        disabled={claimBounty.isPending}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {claimBounty.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Submit to Bounty
      </Button>
    );
  };

  return (
    <div className="sticky top-4 rounded-xl border border-gray-800 bg-background-card p-6 space-y-4">
      {/* Sidebar UI */}
      {showRating && !hasRated && ratingTarget && (
        <RatingModal
          contributor={ratingTarget}
          bounty={{ id: bounty.id, title: bounty.title }}
          onSubmit={handleSubmitRating}
          onClose={() => setShowRating(false)}
        />
      )}

      {/* Show rating and reputation gain after rating */}
      {lastRating && reputationGain && (
        <div className="p-4 mb-4 rounded bg-green-900/60 text-green-200 border border-green-700">
          <div className="mb-1">
            {IS_MAINTAINER
              ? "You rated the contributor:"
              : "Contributor was rated:"}{" "}
            <b>{lastRating} / 5</b> stars
          </div>
          <div>
            Reputation gained: <b>+{reputationGain}</b>
          </div>
        </div>
      )}
      <Button
        asChild
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <a
          href={bounty.githubIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="size-4" />
          View on GitHub
        </a>
      </Button>

      {renderActionButton()}

      <Separator className="bg-gray-800" />

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="size-4" />
          <span>Created {createdTimeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          <span>Updated {updatedTimeAgo}</span>
        </div>
      </div>

      <Separator className="" />

      <Button
        className="w-full gap-2 border border-gray-700"
        onClick={handleCopyLink}
      >
        {copied ? (
          <Check className="size-4 text-success-400" />
        ) : (
          <Link2 className="size-4" />
        )}
        {copied ? "Copied!" : "Share"}
      </Button>
    </div>
  );
}
