"use client";

import { useState, useEffect } from "react";
import { Loader2, Lock, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubmitContestWork } from "@/hooks/use-competition-bounty";
import { useDeadlinePassed } from "@/hooks/use-deadline-passed";

// Accepts https:// URLs or ipfs:// / Qm... / bafy... CIDs
const VALID_SUBMISSION =
  /^(https?:\/\/.+|ipfs:\/\/.+|Qm[1-9A-HJ-NP-Za-km-z]{44,}|bafy[a-z2-7]{50,})$/;

function isValidSubmission(value: string): boolean {
  return VALID_SUBMISSION.test(value.trim());
}

interface CompetitionSubmissionProps {
  bountyId: string;
  deadline: string | null | undefined;
  hasJoined: boolean;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Deadline passed";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m ${sec}s`;
}

export function CompetitionSubmission({
  bountyId,
  deadline,
  hasJoined,
}: CompetitionSubmissionProps) {
  const { data: session } = authClient.useSession();
  const [workCid, setWorkCid] = useState("");
  const submitMutation = useSubmitContestWork();
  const isPastDeadline = useDeadlinePassed(deadline);

  // Countdown display — null on server to avoid hydration mismatch
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => setRemaining(new Date(deadline).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const walletAddress =
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.walletAddress ||
    (session?.user as { walletAddress?: string; address?: string } | undefined)
      ?.address ||
    null;

  if (!hasJoined) return null;

  const trimmed = workCid.trim();
  const isValid = isValidSubmission(trimmed);

  const handleSubmit = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet to submit.");
      return;
    }
    if (!isValid) {
      toast.error(
        "Enter a valid https:// URL or IPFS CID (ipfs://, Qm…, or bafy…).",
      );
      return;
    }
    try {
      await submitMutation.mutateAsync({
        bountyId,
        contributorAddress: walletAddress,
        workCid: trimmed,
      });
      toast.success("Submission recorded on-chain.");
      setWorkCid("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed.");
    }
  };

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Your Submission</h3>
        {deadline && remaining !== null && (
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              isPastDeadline
                ? "text-red-400"
                : remaining < 3_600_000
                  ? "text-amber-400"
                  : "text-gray-400"
            }`}
          >
            <Clock className="size-3" />
            {formatCountdown(remaining)}
          </span>
        )}
      </div>

      {isPastDeadline ? (
        <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/40 p-3 text-xs text-gray-400">
          <Lock className="size-3.5 shrink-0" />
          Submissions are closed. Results will be revealed by the creator.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="work-cid" className="text-xs text-gray-400">
              Submission link or IPFS CID
            </Label>
            <Textarea
              id="work-cid"
              placeholder="https://github.com/... or ipfs://Qm..."
              value={workCid}
              onChange={(e) => setWorkCid(e.target.value)}
              className="min-h-20 resize-none text-sm"
              disabled={submitMutation.isPending}
            />
            {trimmed.length > 0 && !isValid && (
              <p className="text-[11px] text-red-400">
                Must be a https:// URL or IPFS CID (ipfs://, Qm…, bafy…).
              </p>
            )}
          </div>

          <p className="text-[11px] text-gray-500">
            Your submission is hidden from other participants until the
            deadline.
          </p>

          <Button
            className="w-full"
            onClick={() => void handleSubmit()}
            disabled={submitMutation.isPending || !isValid}
          >
            {submitMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Submit Work
          </Button>
        </div>
      )}
    </div>
  );
}
