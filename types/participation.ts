export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Application {
  id: string;
  bountyId: string;
  applicantId: string;
  applicantName?: string; // Optional for UI convenience
  coverLetter: string;
  portfolioUrl?: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
}

export type SubmissionStatus = "pending" | "accepted" | "rejected";

export interface Submission {
  id: string;
  bountyId: string;
  contributorId: string;
  contributorName?: string;
  content: string; // URL or text description
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  feedback?: string;
}

export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

export type ReviewSubmission = {
  submissionId: string;
  contributor: {
    username: string;
    avatarUrl?: string;
  };
  milestoneId?: string;
  submittedAt: string;
  status: ReviewStatus;
};

export type MilestoneStatus = "active" | "completed" | "advanced";

export interface MilestoneParticipation {
  id: string;
  bountyId: string;
  contributorId: string;
  contributorName?: string;
  currentMilestone: number; // 1-based index
  status: MilestoneStatus;
  joinedAt: string;
  lastUpdatedAt: string;
  totalMilestones?: number; // Optional override or cached value
}

export type CompetitionStatus =
  | "registered"
  | "qualified"
  | "disqualified"
  | "winner";

export interface CompetitionParticipation {
  id: string;
  bountyId: string;
  contributorId: string;
  status: CompetitionStatus;
  registeredAt: string;
}
