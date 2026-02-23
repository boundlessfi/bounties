/**
 * Frontend types aligned with the backend GraphQL schema (schema.gql).
 */

export type BountyType = "FIXED_PRICE" | "MILESTONE_BASED" | "COMPETITION";

export type BountyStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "DISPUTED";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface BountyOrganization {
  id: string;
  name: string;
  logo: string | null;
  slug: string | null;
}

export interface BountyProject {
  id: string;
  title: string;
  description: string | null;
}

export interface BountyWindowType {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

export interface BountySubmissionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface BountySubmission {
  id: string;
  bountyId: string;
  submittedBy: string;
  submittedByUser?: BountySubmissionUser | null;
  githubPullRequestUrl: string | null;
  status: string;
  reviewComments: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewedByUser?: BountySubmissionUser | null;
  rewardTransactionHash: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BountyCount {
  submissions: number;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  type: BountyType;
  status: BountyStatus;

  organizationId: string;
  organization?: BountyOrganization | null;
  projectId: string | null;
  project?: BountyProject | null;

  githubIssueUrl: string;
  githubIssueNumber: number | null;

  rewardAmount: number;
  rewardCurrency: string;

  bountyWindowId?: string | null;
  bountyWindow?: BountyWindowType | null;

  submissions?: BountySubmission[] | null;
  _count?: BountyCount | null;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
