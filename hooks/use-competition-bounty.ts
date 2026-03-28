"use client";

import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type CompetitionParticipant = {
  userId: string;
  displayName: string;
  joinedAt: string;
};

export type CompetitionSubmission = {
  id: string;
  participantUserId: string;
  participantDisplayName: string;
  workCid: string;
  submittedAt: string;
};

export type CompetitionAward = {
  id: string;
  recipientUserId: string;
  recipientDisplayName: string;
  payoutAmount: number;
  points: number;
  isWinner: boolean;
  createdAt: string;
};

type CompetitionState = {
  participants: CompetitionParticipant[];
  submissions: CompetitionSubmission[];
  awards: CompetitionAward[];
  finalized: boolean;
  finalizedAt?: string;
};

const DEFAULT_MAX_PARTICIPANTS = 5;

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function useCompetitionBounty({
  bountyId,
  submissionDeadline,
  maxParticipants = DEFAULT_MAX_PARTICIPANTS,
}: {
  bountyId: string;
  submissionDeadline?: string | null;
  maxParticipants?: number;
}) {
  const [state, setState] = useLocalStorage<CompetitionState>(
    `competition-bounty:${bountyId}`,
    {
      participants: [],
      submissions: [],
      awards: [],
      finalized: false,
    },
  );

  const deadlineDate = submissionDeadline ? new Date(submissionDeadline) : null;
  const now = new Date();
  const isAfterDeadline = Boolean(
    deadlineDate &&
    !Number.isNaN(deadlineDate.getTime()) &&
    now >= deadlineDate,
  );

  const remainingSlots = Math.max(
    0,
    maxParticipants - state.participants.length,
  );
  const participantCount = state.participants.length;

  const joinCompetition = (participant: {
    userId: string;
    displayName: string;
  }) => {
    setState((prev) => {
      if (prev.finalized) return prev;
      const alreadyJoined = prev.participants.some(
        (it) => it.userId === participant.userId,
      );
      if (alreadyJoined || prev.participants.length >= maxParticipants) {
        return prev;
      }
      return {
        ...prev,
        participants: [
          ...prev.participants,
          {
            userId: participant.userId,
            displayName: participant.displayName,
            joinedAt: new Date().toISOString(),
          },
        ],
      };
    });
  };

  const submitWork = (input: {
    participantUserId: string;
    participantDisplayName: string;
    workCid: string;
  }) => {
    setState((prev) => {
      if (prev.finalized) return prev;
      if (isAfterDeadline) return prev;
      const participantExists = prev.participants.some(
        (it) => it.userId === input.participantUserId,
      );
      if (!participantExists) return prev;
      const hasSubmission = prev.submissions.some(
        (it) => it.participantUserId === input.participantUserId,
      );
      const nextSubmission: CompetitionSubmission = {
        id: hasSubmission
          ? (prev.submissions.find(
              (it) => it.participantUserId === input.participantUserId,
            )?.id ?? makeId("sub"))
          : makeId("sub"),
        participantUserId: input.participantUserId,
        participantDisplayName: input.participantDisplayName,
        workCid: input.workCid,
        submittedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        submissions: hasSubmission
          ? prev.submissions.map((it) =>
              it.participantUserId === input.participantUserId
                ? nextSubmission
                : it,
            )
          : [...prev.submissions, nextSubmission],
      };
    });
  };

  const approveContestWinner = (input: {
    recipientUserId: string;
    recipientDisplayName: string;
    payoutAmount: number;
    points: number;
    isWinner: boolean;
  }) => {
    setState((prev) => {
      if (prev.finalized || !isAfterDeadline) return prev;
      return {
        ...prev,
        awards: [
          ...prev.awards,
          {
            id: makeId("award"),
            recipientUserId: input.recipientUserId,
            recipientDisplayName: input.recipientDisplayName,
            payoutAmount: input.payoutAmount,
            points: input.points,
            isWinner: input.isWinner,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  };

  const finalizeContest = () => {
    setState((prev) => {
      if (prev.finalized) return prev;
      return {
        ...prev,
        finalized: true,
        finalizedAt: new Date().toISOString(),
      };
    });
  };

  const revealedSubmissions = useMemo(() => {
    if (!isAfterDeadline) return [];
    return [...state.submissions].sort(
      (a, b) =>
        hashString(`${bountyId}:${a.id}`) - hashString(`${bountyId}:${b.id}`),
    );
  }, [bountyId, isAfterDeadline, state.submissions]);

  const winnerAwards = state.awards.filter((it) => it.isWinner);
  const consolationAwards = state.awards.filter((it) => !it.isWinner);

  return {
    state,
    participantCount,
    remainingSlots,
    maxParticipants,
    isAfterDeadline,
    hasDeadline: Boolean(deadlineDate),
    joinCompetition,
    submitWork,
    approveContestWinner,
    finalizeContest,
    revealedSubmissions,
    winnerAwards,
    consolationAwards,
  };
}
