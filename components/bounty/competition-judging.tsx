"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompetitionBounty } from "@/hooks/use-competition-bounty";

type SessionUser = {
  id: string;
  name?: string | null;
};

export function CompetitionJudging({
  bountyId,
  creatorId,
  deadline,
  rewardAmount,
  maxParticipants = 5,
}: {
  bountyId: string;
  creatorId: string;
  deadline?: string | null;
  rewardAmount: number;
  maxParticipants?: number;
}) {
  const { data: session } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;
  const [payoutBySubmission, setPayoutBySubmission] = useState<
    Record<string, string>
  >({});
  const [pointsBySubmission, setPointsBySubmission] = useState<
    Record<string, string>
  >({});

  const {
    state,
    isAfterDeadline,
    revealedSubmissions,
    approveContestWinner,
    finalizeContest,
  } = useCompetitionBounty({
    bountyId,
    submissionDeadline: deadline,
    maxParticipants,
  });

  const isCreator = user?.id === creatorId;

  const awardedUserIds = useMemo(
    () => new Set(state.awards.map((it) => it.recipientUserId)),
    [state.awards],
  );

  const handleAward = (submissionId: string, isWinner: boolean) => {
    const submission = revealedSubmissions.find((it) => it.id === submissionId);
    if (!submission) return;

    const payout = Number(payoutBySubmission[submissionId] || "0");
    const points = Number(pointsBySubmission[submissionId] || "0");
    if (!Number.isFinite(payout) || payout <= 0) {
      toast.error("Enter a valid payout amount.");
      return;
    }

    approveContestWinner({
      recipientUserId: submission.participantUserId,
      recipientDisplayName: submission.participantDisplayName,
      payoutAmount: payout,
      points: Number.isFinite(points) ? points : 0,
      isWinner,
    });
    toast.success(isWinner ? "Winner selected." : "Consolation awarded.");
  };

  const handleFinalize = () => {
    if (state.awards.length === 0) {
      toast.error("Select at least one winner or consolation award first.");
      return;
    }
    finalizeContest();
    toast.success("Contest finalized.");
  };

  if (!isCreator) return null;

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-200">
          Competition Judging
        </h3>
        <span className="text-xs text-gray-400">
          Prize pool: ${rewardAmount}
        </span>
      </div>

      {!isAfterDeadline ? (
        <p className="text-xs text-gray-500">
          Judging opens after the submission deadline.
        </p>
      ) : revealedSubmissions.length === 0 ? (
        <p className="text-xs text-gray-500">No submissions to review.</p>
      ) : (
        <div className="space-y-3">
          {revealedSubmissions.map((submission, index) => {
            const alreadyAwarded = awardedUserIds.has(
              submission.participantUserId,
            );
            return (
              <div
                key={submission.id}
                className="rounded-lg border border-gray-700 p-3 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-200">
                    Submission #{index + 1}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-300 break-all">
                  {submission.workCid}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    inputMode="decimal"
                    placeholder="Payout amount"
                    value={payoutBySubmission[submission.id] || ""}
                    onChange={(event) =>
                      setPayoutBySubmission((prev) => ({
                        ...prev,
                        [submission.id]: event.target.value,
                      }))
                    }
                    disabled={state.finalized || alreadyAwarded}
                  />
                  <Input
                    inputMode="numeric"
                    placeholder="Points"
                    value={pointsBySubmission[submission.id] || ""}
                    onChange={(event) =>
                      setPointsBySubmission((prev) => ({
                        ...prev,
                        [submission.id]: event.target.value,
                      }))
                    }
                    disabled={state.finalized || alreadyAwarded}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAward(submission.id, true)}
                    disabled={state.finalized || alreadyAwarded}
                  >
                    Select as Winner
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAward(submission.id, false)}
                    disabled={state.finalized || alreadyAwarded}
                  >
                    Award Consolation
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-gray-800 pt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          {state.finalized
            ? "Contest finalized"
            : "Finalizing locks further awards."}
        </p>
        <Button
          type="button"
          variant={state.finalized ? "outline" : "default"}
          onClick={handleFinalize}
          disabled={state.finalized || !isAfterDeadline}
        >
          Finalize Contest
        </Button>
      </div>
    </div>
  );
}
