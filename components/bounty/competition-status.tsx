"use client";

import { useCompetitionBounty } from "@/hooks/use-competition-bounty";

export function CompetitionStatus({
  bountyId,
  deadline,
  maxParticipants = 5,
}: {
  bountyId: string;
  deadline?: string | null;
  maxParticipants?: number;
}) {
  const { state, isAfterDeadline, winnerAwards, consolationAwards } =
    useCompetitionBounty({
      bountyId,
      submissionDeadline: deadline,
      maxParticipants,
    });

  const totalSubmissions = state.submissions.length;

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-3">
      <h3 className="text-sm font-semibold text-gray-200">
        Competition Status
      </h3>

      {!isAfterDeadline ? (
        <p className="text-xs text-gray-400">
          {totalSubmissions} submissions received (hidden until deadline)
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-400">
            Reveal complete: {totalSubmissions} submissions visible
          </p>
          {state.submissions.length > 0 && (
            <div className="space-y-2">
              {state.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="text-xs border border-gray-700 bg-gray-900/30 rounded-md p-2"
                >
                  <p className="text-gray-300 break-all">
                    {submission.workCid}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {winnerAwards.length > 0 && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          Winner{winnerAwards.length > 1 ? "s" : ""}:{" "}
          {winnerAwards
            .map(
              (award) =>
                `${award.recipientDisplayName} ($${award.payoutAmount})`,
            )
            .join(", ")}
        </div>
      )}

      {consolationAwards.length > 0 && (
        <div className="rounded-md border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-300">
          Consolation:{" "}
          {consolationAwards
            .map(
              (award) =>
                `${award.recipientDisplayName} ($${award.payoutAmount})`,
            )
            .join(", ")}
        </div>
      )}

      {state.finalized && (
        <p className="text-xs text-gray-500">
          Contest finalized. Further winner approvals are disabled.
        </p>
      )}
    </div>
  );
}
