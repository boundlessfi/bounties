"use client";

import { Users, Clock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useDeadlinePassed } from "@/hooks/use-deadline-passed";

interface CompetitionStatusProps {
  // NOTE: claimCount is a pending backend field (not yet in schema).
  // Until it ships, this falls back to _count.submissions (submitted entries
  // only). A dedicated claimCount on BountyCount is tracked in the backend
  // schema backlog — at that point this prop will reflect true join count.
  claimCount: number;
  maxParticipants?: number | null;
  submissionCount: number;
  deadline: string | null | undefined;
  isFinalized: boolean;
}

export function CompetitionStatus({
  claimCount,
  maxParticipants,
  submissionCount,
  deadline,
  isFinalized,
}: CompetitionStatusProps) {
  const pastDeadline = useDeadlinePassed(deadline);

  return (
    <div className="rounded-xl border border-gray-800 bg-background-card p-4 space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Competition Status
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {/* Participants */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-gray-500 shrink-0" />
          <span className="text-gray-300">
            {claimCount}
            {maxParticipants != null ? `/${maxParticipants}` : ""}{" "}
            <span className="text-gray-500 text-xs">joined</span>
          </span>
        </div>

        {/* Submissions */}
        <div className="flex items-center gap-2 text-sm">
          {pastDeadline ? (
            <Eye className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <EyeOff className="size-4 text-gray-500 shrink-0" />
          )}
          <span className="text-gray-300">
            {pastDeadline ? submissionCount : "?"}{" "}
            <span className="text-gray-500 text-xs">
              {pastDeadline ? "revealed" : "hidden"}
            </span>
          </span>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2 text-xs">
        {isFinalized ? (
          <>
            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-medium">
              Results published
            </span>
          </>
        ) : pastDeadline ? (
          <>
            <Clock className="size-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-400 font-medium">
              Judging in progress
            </span>
          </>
        ) : (
          <>
            <Clock className="size-3.5 text-blue-400 shrink-0" />
            <span className="text-blue-400 font-medium">
              Accepting submissions
            </span>
          </>
        )}
      </div>
    </div>
  );
}
