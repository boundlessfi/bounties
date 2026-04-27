"use client";

import { useState } from "react";
import { Loader2, Trophy, Award, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useApproveContestWinner,
  useFinalizeContest,
} from "@/hooks/use-competition-bounty";

// Stellar assets use 7 decimal places (1 XLM = 10_000_000 stroops).
// If the platform ever supports assets with different precision, derive
// this from the currency symbol instead of hardcoding.
const STELLAR_ASSET_SCALE = 1e7;

interface Submission {
  id: string;
  submittedBy: string;
  submittedByUser?: { name?: string | null; image?: string | null } | null;
  githubPullRequestUrl?: string | null;
  // "APPROVED" status comes from the backend after approve_contest_winner
  status: string;
}

export type { Submission as CompetitionSubmissionEntry };

interface CompetitionJudgingProps {
  bountyId: string;
  submissions: Submission[];
  isFinalized: boolean;
  totalReward: number | null | undefined;
  currency: string | null | undefined;
}

export function CompetitionJudging({
  bountyId,
  submissions,
  isFinalized,
  totalReward,
  currency,
}: CompetitionJudgingProps) {
  const { data: session } = authClient.useSession();
  const approveMutation = useApproveContestWinner();
  const finalizeMutation = useFinalizeContest();

  const [payouts, setPayouts] = useState<Record<string, string>>({});
  const [points, setPoints] = useState<Record<string, string>>({});
  // Optimistic local set — augments backend status for immediate feedback.
  // On next query invalidation the backend status takes over.
  const [localApproved, setLocalApproved] = useState<Set<string>>(new Set());

  const walletAddress =
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.walletAddress ||
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.address ||
    null;

  const handleApprove = async (sub: Submission) => {
    if (!walletAddress) {
      toast.error("Connect your wallet to approve.");
      return;
    }
    const payout = parseFloat(payouts[sub.id] ?? "");
    const pts = parseInt(points[sub.id] ?? "10", 10);
    if (!isFinite(payout) || payout <= 0) {
      toast.error("Enter a valid payout amount greater than 0.");
      return;
    }
    if (!isFinite(pts) || pts < 0) {
      toast.error("Reputation points must be a non-negative number.");
      return;
    }
    try {
      await approveMutation.mutateAsync({
        bountyId,
        creatorAddress: walletAddress,
        winner: sub.submittedBy,
        payoutAmount: BigInt(Math.round(payout * STELLAR_ASSET_SCALE)),
        points: pts,
      });
      setLocalApproved((prev) => new Set(prev).add(sub.id));
      toast.success(
        `Payment approved for ${sub.submittedByUser?.name ?? sub.submittedBy}.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approval failed.");
    }
  };

  const handleFinalize = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet to finalize.");
      return;
    }
    try {
      await finalizeMutation.mutateAsync({
        bountyId,
        creatorAddress: walletAddress,
      });
      toast.success("Contest finalized. No further approvals allowed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Finalization failed.");
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="p-5 rounded-xl border border-gray-800 bg-background-card text-center text-sm text-gray-400">
        No submissions to review yet.
      </div>
    );
  }

  const pendingWinner = approveMutation.isPending
    ? approveMutation.variables?.winner
    : null;

  // Any submission approved either by backend status or local optimism
  const isApproved = (sub: Submission) =>
    sub.status === "APPROVED" || localApproved.has(sub.id);

  const anyApproved =
    submissions.some((s) => s.status === "APPROVED") || localApproved.size > 0;

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Trophy className="size-4 text-amber-400" />
          Judge Submissions
        </h3>
        <span className="text-xs text-gray-500">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {submissions.map((sub, idx) => {
          const approved = isApproved(sub);
          const name = sub.submittedByUser?.name ?? sub.submittedBy;
          const isThisPending =
            approveMutation.isPending && pendingWinner === sub.submittedBy;

          return (
            <div
              key={sub.id}
              className={`rounded-lg border p-4 space-y-3 transition-colors ${
                approved
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-gray-700 bg-gray-900/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                  <span className="text-sm font-medium text-gray-200">
                    {name}
                  </span>
                  {approved && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                      <CheckCircle2 className="size-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                </div>
                {/* "Top" badge only on the first unapproved entry — not a ranking signal */}
                {idx === 0 && !approved && (
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                    <Award className="size-3 mr-1" />
                    First
                  </Badge>
                )}
              </div>

              {sub.githubPullRequestUrl && (
                <a
                  href={sub.githubPullRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline break-all"
                >
                  {sub.githubPullRequestUrl}
                </a>
              )}

              {!isFinalized && !approved && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-gray-400">
                      Payout ({currency ?? "XLM"})
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={totalReward ?? undefined}
                      placeholder={
                        totalReward != null ? String(totalReward) : "0"
                      }
                      value={payouts[sub.id] ?? ""}
                      onChange={(e) =>
                        setPayouts((p) => ({ ...p, [sub.id]: e.target.value }))
                      }
                      className="h-8 text-sm"
                      disabled={approveMutation.isPending}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-gray-400">
                      Rep. Points
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="10"
                      value={points[sub.id] ?? ""}
                      onChange={(e) =>
                        setPoints((p) => ({ ...p, [sub.id]: e.target.value }))
                      }
                      className="h-8 text-sm"
                      disabled={approveMutation.isPending}
                    />
                  </div>
                </div>
              )}

              {!isFinalized && !approved && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => void handleApprove(sub)}
                  disabled={approveMutation.isPending || !walletAddress}
                >
                  {isThisPending ? (
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                  ) : (
                    <Trophy className="mr-2 size-3.5" />
                  )}
                  {idx === 0 ? "Select as Winner" : "Award Consolation"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {!isFinalized && anyApproved && (
        <>
          <Separator className="bg-gray-800/60" />
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              Finalize to close the contest and prevent further approvals.
            </p>
            <Button
              variant="outline"
              className="w-full border-gray-700 hover:bg-gray-800"
              onClick={() => void handleFinalize()}
              disabled={finalizeMutation.isPending || !walletAddress}
            >
              {finalizeMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Lock className="mr-2 size-4" />
              )}
              Finalize Contest
            </Button>
          </div>
        </>
      )}

      {isFinalized && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/40 p-3 text-xs text-gray-400">
          <Lock className="size-3.5 shrink-0" />
          Contest finalized. Results are published.
        </div>
      )}
    </div>
  );
}
