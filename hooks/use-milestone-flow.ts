import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type {
  MilestoneDefinition,
  MilestoneFlowState,
  MilestoneParticipant,
  MilestoneSubmissionEntry,
  MilestoneSubmissionReviewStatus,
} from "@/types/milestone-flow";

const FLOW_KEY_PREFIX = "milestone_flow_";

function createDefaultMilestones(): MilestoneDefinition[] {
  return [
    {
      id: "m1",
      title: "Milestone 1 - Build",
      description: "Ship an initial implementation and open a first PR.",
      maxWinners: 8,
      rewardPercentage: 30,
    },
    {
      id: "m2",
      title: "Milestone 2 - Harden",
      description:
        "Refine implementation quality based on review feedback and testing.",
      maxWinners: 4,
      rewardPercentage: 30,
    },
    {
      id: "m3",
      title: "Milestone 3 - Finalize",
      description:
        "Deliver the production-ready version and final documentation.",
      maxWinners: 2,
      rewardPercentage: 40,
    },
  ];
}

function createInitialState(bountyId: string): MilestoneFlowState {
  return {
    bountyId,
    milestones: createDefaultMilestones(),
    participants: [],
    submissions: [],
    updatedAt: new Date().toISOString(),
  };
}

function nowIso() {
  return new Date().toISOString();
}

function isStageOccupied(
  participant: MilestoneParticipant,
  stageIndex: number,
): boolean {
  if (participant.currentMilestoneIndex !== stageIndex) return false;
  return participant.status === "ACTIVE" || participant.status === "SUBMITTED";
}

export function useMilestoneFlow(bountyId: string) {
  const [state, setState] = useLocalStorage<MilestoneFlowState>(
    `${FLOW_KEY_PREFIX}${bountyId}`,
    createInitialState(bountyId),
  );

  const participantByContributor = useMemo(() => {
    const map = new Map<string, MilestoneParticipant>();
    state.participants.forEach((participant) => {
      map.set(participant.contributorId, participant);
    });
    return map;
  }, [state.participants]);

  const pendingSubmissions = useMemo(
    () =>
      state.submissions.filter((submission) => submission.status === "PENDING"),
    [state.submissions],
  );

  const getParticipant = (contributorId: string) =>
    participantByContributor.get(contributorId);

  const joinFlow = (contributorId: string, contributorName: string) => {
    setState((current) => {
      const existing = current.participants.find(
        (participant) => participant.contributorId === contributorId,
      );
      if (existing) return current;

      const firstMilestone = current.milestones[0];
      const occupied = current.participants.filter((participant) =>
        isStageOccupied(participant, 0),
      ).length;

      if (occupied >= firstMilestone.maxWinners) {
        throw new Error("Milestone 1 is full. Try again later.");
      }

      const timestamp = nowIso();
      const newParticipant: MilestoneParticipant = {
        id: `mp_${bountyId}_${Date.now()}`,
        bountyId,
        contributorId,
        contributorName,
        currentMilestoneIndex: 0,
        status: "ACTIVE",
        joinedAt: timestamp,
        updatedAt: timestamp,
      };

      return {
        ...current,
        participants: [...current.participants, newParticipant],
        updatedAt: timestamp,
      };
    });
  };

  const submitMilestone = (
    contributorId: string,
    githubPullRequestUrl: string,
    comments?: string,
  ) => {
    setState((current) => {
      const participant = current.participants.find(
        (item) => item.contributorId === contributorId,
      );

      if (!participant) {
        throw new Error("Join the flow before submitting a milestone.");
      }

      if (participant.status !== "ACTIVE") {
        throw new Error("You can only submit while your milestone is active.");
      }

      const duplicatePending = current.submissions.some(
        (submission) =>
          submission.participantId === participant.id &&
          submission.milestoneIndex === participant.currentMilestoneIndex &&
          submission.status === "PENDING",
      );

      if (duplicatePending) {
        throw new Error(
          "You already have a pending submission for this milestone.",
        );
      }

      const timestamp = nowIso();
      const submission: MilestoneSubmissionEntry = {
        id: `ms_${bountyId}_${Date.now()}`,
        bountyId,
        participantId: participant.id,
        contributorId,
        contributorName: participant.contributorName,
        milestoneIndex: participant.currentMilestoneIndex,
        githubPullRequestUrl,
        comments,
        status: "PENDING",
        submittedAt: timestamp,
      };

      return {
        ...current,
        submissions: [...current.submissions, submission],
        participants: current.participants.map((item) =>
          item.id === participant.id
            ? { ...item, status: "SUBMITTED", updatedAt: timestamp }
            : item,
        ),
        updatedAt: timestamp,
      };
    });
  };

  const reviewSubmission = (
    submissionId: string,
    reviewerId: string,
    decision: Exclude<MilestoneSubmissionReviewStatus, "PENDING">,
    reviewComments?: string,
  ) => {
    setState((current) => {
      const submission = current.submissions.find(
        (item) => item.id === submissionId,
      );
      if (!submission) {
        throw new Error("Submission not found.");
      }
      if (submission.status !== "PENDING") {
        throw new Error("Submission has already been reviewed.");
      }

      const participant = current.participants.find(
        (item) => item.id === submission.participantId,
      );
      if (!participant) {
        throw new Error("Participant not found.");
      }

      const timestamp = nowIso();
      const isLastMilestone =
        submission.milestoneIndex >= current.milestones.length - 1;

      let updatedParticipant: MilestoneParticipant = participant;

      if (decision === "REJECTED") {
        updatedParticipant = {
          ...participant,
          status: "REJECTED",
          updatedAt: timestamp,
        };
      } else if (isLastMilestone) {
        updatedParticipant = {
          ...participant,
          status: "COMPLETED",
          updatedAt: timestamp,
        };
      } else {
        const nextMilestoneIndex = submission.milestoneIndex + 1;
        const nextMilestone = current.milestones[nextMilestoneIndex];

        const occupiedNextStage = current.participants.filter((item) =>
          isStageOccupied(item, nextMilestoneIndex),
        ).length;

        if (occupiedNextStage >= nextMilestone.maxWinners) {
          throw new Error(
            `${nextMilestone.title} has no open slots. Review queue before advancing.`,
          );
        }

        updatedParticipant = {
          ...participant,
          currentMilestoneIndex: nextMilestoneIndex,
          status: "ACTIVE",
          updatedAt: timestamp,
        };
      }

      return {
        ...current,
        submissions: current.submissions.map((item) =>
          item.id === submissionId
            ? {
                ...item,
                status: decision,
                reviewedAt: timestamp,
                reviewedBy: reviewerId,
                reviewComments,
              }
            : item,
        ),
        participants: current.participants.map((item) =>
          item.id === participant.id ? updatedParticipant : item,
        ),
        updatedAt: timestamp,
      };
    });
  };

  const stageOccupancy = useMemo(() => {
    return state.milestones.map((_, index) => {
      return state.participants.filter((participant) =>
        isStageOccupied(participant, index),
      ).length;
    });
  }, [state.milestones, state.participants]);

  return {
    state,
    pendingSubmissions,
    stageOccupancy,
    getParticipant,
    joinFlow,
    submitMilestone,
    reviewSubmission,
  };
}
