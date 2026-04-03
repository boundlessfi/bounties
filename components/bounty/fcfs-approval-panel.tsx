"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApproveFcfs } from "@/hooks/use-claim-bounty";

type FcfsApprovalBounty = {
  id: string;
  type: string;
  status: string;
  createdBy: string;
  submissions?: Array<{
    id: string;
    githubPullRequestUrl?: string | null;
    submittedBy?: string;
    submittedByUser?: { name?: string | null } | null;
  }> | null;
};

export function FcfsApprovalPanel({ bounty }: { bounty: FcfsApprovalBounty }) {
  const { data: session } = authClient.useSession();
  const approveMutation = useApproveFcfs();
  const [points, setPoints] = useState(10);

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const walletAddress =
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.walletAddress ||
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.address ||
    null;

  const isCreator = Boolean(
    currentUserId && currentUserId === bounty.createdBy,
  );
  const isFcfs = bounty.type === "FIXED_PRICE";
  const isReviewState =
    bounty.status === "IN_REVIEW" || bounty.status === "UNDER_REVIEW";

  if (!isFcfs || !isCreator || !isReviewState) return null;

  const targetSubmission = bounty.submissions?.[0];

  const handleApprove = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet to approve this FCFS bounty.");
      return;
    }
    if (!Number.isFinite(points) || points < 0) {
      toast.error("Points must be a valid non-negative number.");
      return;
    }
    try {
      await approveMutation.mutateAsync({
        bountyId: bounty.id,
        creatorAddress: walletAddress,
        points,
      });
      toast.success("Approved and released payment.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed.");
    }
  };

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-4">
      <h3 className="text-sm font-semibold text-gray-200">
        FCFS Approval & Release
      </h3>

      {targetSubmission ? (
        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-3 text-xs space-y-1">
          <p className="text-gray-300">
            Contributor:{" "}
            {targetSubmission.submittedByUser?.name ||
              targetSubmission.submittedBy}
          </p>
          {targetSubmission.githubPullRequestUrl &&
          targetSubmission.githubPullRequestUrl.startsWith("https://") ? (
            <Link
              href={targetSubmission.githubPullRequestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {targetSubmission.githubPullRequestUrl}
            </Link>
          ) : targetSubmission.githubPullRequestUrl ? (
            <span className="text-xs text-gray-400 break-all">
              {targetSubmission.githubPullRequestUrl}
            </span>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          No submission metadata is available yet. You can still approve using
          on-chain state.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="fcfs-approval-points">Reputation points</Label>
        <Input
          id="fcfs-approval-points"
          type="number"
          min={0}
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
      </div>

      {!walletAddress && (
        <p className="text-sm text-amber-400 text-center py-2">
          Connect your wallet to approve this bounty.
        </p>
      )}

      <Button
        className="w-full"
        onClick={() => void handleApprove()}
        disabled={approveMutation.isPending || !walletAddress}
      >
        {approveMutation.isPending && (
          <Loader2 className="mr-2 size-4 animate-spin" />
        )}
        Approve & Release Payment
      </Button>
    </div>
  );
}
