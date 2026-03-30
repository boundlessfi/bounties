export type MilestoneSubmissionReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type MilestoneParticipantStatus =
  | "ACTIVE"
  | "SUBMITTED"
  | "REJECTED"
  | "COMPLETED";

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  maxWinners: number;
  rewardPercentage: number;
}

export interface MilestoneParticipant {
  id: string;
  bountyId: string;
  contributorId: string;
  contributorName: string;
  currentMilestoneIndex: number;
  status: MilestoneParticipantStatus;
  joinedAt: string;
  updatedAt: string;
}

export interface MilestoneSubmissionEntry {
  id: string;
  bountyId: string;
  participantId: string;
  contributorId: string;
  contributorName: string;
  milestoneIndex: number;
  githubPullRequestUrl: string;
  comments?: string;
  status: MilestoneSubmissionReviewStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
}

export interface MilestoneFlowState {
  bountyId: string;
  milestones: MilestoneDefinition[];
  participants: MilestoneParticipant[];
  submissions: MilestoneSubmissionEntry[];
  updatedAt: string;
}
