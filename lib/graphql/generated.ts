import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { fetcher } from "./client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
};

export type Bounty = {
  __typename?: "Bounty";
  _count?: Maybe<BountyCount>;
  bountyWindow?: Maybe<BountyWindowType>;
  bountyWindowId?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  createdBy: Scalars["String"]["output"];
  description: Scalars["String"]["output"];
  githubIssueNumber?: Maybe<Scalars["Int"]["output"]>;
  githubIssueUrl: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  organization?: Maybe<BountyOrganization>;
  organizationId: Scalars["String"]["output"];
  project?: Maybe<BountyProject>;
  projectId?: Maybe<Scalars["String"]["output"]>;
  rewardAmount: Scalars["Float"]["output"];
  rewardCurrency: Scalars["String"]["output"];
  status: Scalars["String"]["output"];
  submissions?: Maybe<Array<BountySubmissionType>>;
  title: Scalars["String"]["output"];
  type: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type BountyCount = {
  __typename?: "BountyCount";
  submissions: Scalars["Int"]["output"];
};

export type BountyOrganization = {
  __typename?: "BountyOrganization";
  id: Scalars["ID"]["output"];
  logo?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  slug?: Maybe<Scalars["String"]["output"]>;
};

export type BountyProject = {
  __typename?: "BountyProject";
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
};

export type BountyQueryInput = {
  bountyWindowId?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  organizationId?: InputMaybe<Scalars["String"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  projectId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<Scalars["String"]["input"]>;
  sortOrder?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<BountyStatus>;
  type?: InputMaybe<BountyType>;
};

export enum BountyStatus {
  Cancelled = "CANCELLED",
  Completed = "COMPLETED",
  Disputed = "DISPUTED",
  Draft = "DRAFT",
  InProgress = "IN_PROGRESS",
  Open = "OPEN",
  Submitted = "SUBMITTED",
  UnderReview = "UNDER_REVIEW",
}

export type BountySubmissionType = {
  __typename?: "BountySubmissionType";
  bountyId: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  githubPullRequestUrl?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  paidAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewComments?: Maybe<Scalars["String"]["output"]>;
  reviewedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewedBy?: Maybe<Scalars["String"]["output"]>;
  reviewedByUser?: Maybe<BountySubmissionUser>;
  rewardTransactionHash?: Maybe<Scalars["String"]["output"]>;
  status: Scalars["String"]["output"];
  submittedBy: Scalars["String"]["output"];
  submittedByUser?: Maybe<BountySubmissionUser>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type BountySubmissionUser = {
  __typename?: "BountySubmissionUser";
  email?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  image?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

export enum BountyType {
  Competition = "COMPETITION",
  FixedPrice = "FIXED_PRICE",
  MilestoneBased = "MILESTONE_BASED",
}

export type BountyWindowType = {
  __typename?: "BountyWindowType";
  endDate?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  startDate?: Maybe<Scalars["DateTime"]["output"]>;
  status: Scalars["String"]["output"];
};

export type CreateBountyInput = {
  bountyWindowId?: InputMaybe<Scalars["String"]["input"]>;
  description: Scalars["String"]["input"];
  githubIssueNumber?: InputMaybe<Scalars["Int"]["input"]>;
  githubIssueUrl: Scalars["String"]["input"];
  organizationId: Scalars["String"]["input"];
  projectId?: InputMaybe<Scalars["String"]["input"]>;
  rewardAmount: Scalars["Float"]["input"];
  rewardCurrency: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
  type: BountyType;
};

export type CreateSubmissionInput = {
  bountyId: Scalars["String"]["input"];
  comments?: InputMaybe<Scalars["String"]["input"]>;
  githubPullRequestUrl: Scalars["String"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  /** Create a new bounty (organization members only) */
  createBounty: Bounty;
  /** Delete a bounty (organization admins/owners only) */
  deleteBounty: Scalars["Boolean"]["output"];
  /** Mark a submission as paid (organization admins/owners only) */
  markSubmissionPaid: BountySubmissionType;
  /** Review a bounty submission (organization members only) */
  reviewSubmission: BountySubmissionType;
  /** Submit to a bounty (any authenticated user) */
  submitToBounty: BountySubmissionType;
  /** Update an existing bounty (organization members only) */
  updateBounty: Bounty;
};

export type MutationCreateBountyArgs = {
  input: CreateBountyInput;
};

export type MutationDeleteBountyArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationMarkSubmissionPaidArgs = {
  submissionId: Scalars["ID"]["input"];
  transactionHash: Scalars["String"]["input"];
};

export type MutationReviewSubmissionArgs = {
  input: ReviewSubmissionInput;
};

export type MutationSubmitToBountyArgs = {
  input: CreateSubmissionInput;
};

export type MutationUpdateBountyArgs = {
  input: UpdateBountyInput;
};

export type PaginatedBounties = {
  __typename?: "PaginatedBounties";
  bounties: Array<Bounty>;
  limit: Scalars["Int"]["output"];
  offset: Scalars["Int"]["output"];
  total: Scalars["Int"]["output"];
};

export type Query = {
  __typename?: "Query";
  /** Get all currently active bounties */
  activeBounties: Array<Bounty>;
  /** Get paginated list of bounties with filtering */
  bounties: PaginatedBounties;
  /** Get a single bounty by ID */
  bounty: Bounty;
  /** Get bounties for a specific organization */
  organizationBounties: Array<Bounty>;
  /** Get bounties for a specific project */
  projectBounties: Array<Bounty>;
};

export type QueryBountiesArgs = {
  query?: InputMaybe<BountyQueryInput>;
};

export type QueryBountyArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryOrganizationBountiesArgs = {
  organizationId: Scalars["ID"]["input"];
};

export type QueryProjectBountiesArgs = {
  projectId: Scalars["ID"]["input"];
};

export type ReviewSubmissionInput = {
  reviewComments?: InputMaybe<Scalars["String"]["input"]>;
  status: Scalars["String"]["input"];
  submissionId: Scalars["ID"]["input"];
};

export type UpdateBountyInput = {
  bountyWindowId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  githubIssueNumber?: InputMaybe<Scalars["Int"]["input"]>;
  githubIssueUrl?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  rewardAmount?: InputMaybe<Scalars["Float"]["input"]>;
  rewardCurrency?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<BountyType>;
};

export type CreateBountyMutationVariables = Exact<{
  input: CreateBountyInput;
}>;

export type CreateBountyMutation = {
  __typename?: "Mutation";
  createBounty: {
    __typename?: "Bounty";
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    rewardAmount: number;
    rewardCurrency: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    projectId?: string | null;
    bountyWindowId?: string | null;
    githubIssueUrl: string;
    githubIssueNumber?: number | null;
    organization?: {
      __typename?: "BountyOrganization";
      id: string;
      name: string;
      logo?: string | null;
      slug?: string | null;
    } | null;
    project?: {
      __typename?: "BountyProject";
      id: string;
      title: string;
      description?: string | null;
    } | null;
    bountyWindow?: {
      __typename?: "BountyWindowType";
      id: string;
      name: string;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
    } | null;
    _count?: { __typename?: "BountyCount"; submissions: number } | null;
  };
};

export type UpdateBountyMutationVariables = Exact<{
  input: UpdateBountyInput;
}>;

export type UpdateBountyMutation = {
  __typename?: "Mutation";
  updateBounty: {
    __typename?: "Bounty";
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    rewardAmount: number;
    rewardCurrency: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    projectId?: string | null;
    bountyWindowId?: string | null;
    githubIssueUrl: string;
    githubIssueNumber?: number | null;
    organization?: {
      __typename?: "BountyOrganization";
      id: string;
      name: string;
      logo?: string | null;
      slug?: string | null;
    } | null;
    project?: {
      __typename?: "BountyProject";
      id: string;
      title: string;
      description?: string | null;
    } | null;
    bountyWindow?: {
      __typename?: "BountyWindowType";
      id: string;
      name: string;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
    } | null;
    _count?: { __typename?: "BountyCount"; submissions: number } | null;
  };
};

export type DeleteBountyMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type DeleteBountyMutation = {
  __typename?: "Mutation";
  deleteBounty: boolean;
};

export type BountiesQueryVariables = Exact<{
  query?: InputMaybe<BountyQueryInput>;
}>;

export type BountiesQuery = {
  __typename?: "Query";
  bounties: {
    __typename?: "PaginatedBounties";
    total: number;
    limit: number;
    offset: number;
    bounties: Array<{
      __typename?: "Bounty";
      id: string;
      title: string;
      description: string;
      status: string;
      type: string;
      rewardAmount: number;
      rewardCurrency: string;
      createdAt: string;
      updatedAt: string;
      organizationId: string;
      projectId?: string | null;
      bountyWindowId?: string | null;
      githubIssueUrl: string;
      githubIssueNumber?: number | null;
      organization?: {
        __typename?: "BountyOrganization";
        id: string;
        name: string;
        logo?: string | null;
        slug?: string | null;
      } | null;
      project?: {
        __typename?: "BountyProject";
        id: string;
        title: string;
        description?: string | null;
      } | null;
      bountyWindow?: {
        __typename?: "BountyWindowType";
        id: string;
        name: string;
        status: string;
        startDate?: string | null;
        endDate?: string | null;
      } | null;
      _count?: { __typename?: "BountyCount"; submissions: number } | null;
    }>;
  };
};

export type BountyQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type BountyQuery = {
  __typename?: "Query";
  bounty: {
    __typename?: "Bounty";
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    rewardAmount: number;
    rewardCurrency: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    projectId?: string | null;
    bountyWindowId?: string | null;
    githubIssueUrl: string;
    githubIssueNumber?: number | null;
    submissions?: Array<{
      __typename?: "BountySubmissionType";
      id: string;
      bountyId: string;
      submittedBy: string;
      githubPullRequestUrl?: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
      reviewedAt?: string | null;
      reviewedBy?: string | null;
      reviewComments?: string | null;
      paidAt?: string | null;
      rewardTransactionHash?: string | null;
      submittedByUser?: {
        __typename?: "BountySubmissionUser";
        id: string;
        name?: string | null;
        image?: string | null;
      } | null;
      reviewedByUser?: {
        __typename?: "BountySubmissionUser";
        id: string;
        name?: string | null;
        image?: string | null;
      } | null;
    }> | null;
    organization?: {
      __typename?: "BountyOrganization";
      id: string;
      name: string;
      logo?: string | null;
      slug?: string | null;
    } | null;
    project?: {
      __typename?: "BountyProject";
      id: string;
      title: string;
      description?: string | null;
    } | null;
    bountyWindow?: {
      __typename?: "BountyWindowType";
      id: string;
      name: string;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
    } | null;
    _count?: { __typename?: "BountyCount"; submissions: number } | null;
  };
};

export type ActiveBountiesQueryVariables = Exact<{ [key: string]: never }>;

export type ActiveBountiesQuery = {
  __typename?: "Query";
  activeBounties: Array<{
    __typename?: "Bounty";
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    rewardAmount: number;
    rewardCurrency: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    projectId?: string | null;
    bountyWindowId?: string | null;
    githubIssueUrl: string;
    githubIssueNumber?: number | null;
    organization?: {
      __typename?: "BountyOrganization";
      id: string;
      name: string;
      logo?: string | null;
      slug?: string | null;
    } | null;
    project?: {
      __typename?: "BountyProject";
      id: string;
      title: string;
      description?: string | null;
    } | null;
    bountyWindow?: {
      __typename?: "BountyWindowType";
      id: string;
      name: string;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
    } | null;
    _count?: { __typename?: "BountyCount"; submissions: number } | null;
  }>;
};

export type OrganizationBountiesQueryVariables = Exact<{
  organizationId: Scalars["ID"]["input"];
}>;

export type OrganizationBountiesQuery = {
  __typename?: "Query";
  organizationBounties: Array<{
    __typename?: "Bounty";
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    rewardAmount: number;
    rewardCurrency: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    projectId?: string | null;
    bountyWindowId?: string | null;
    githubIssueUrl: string;
    githubIssueNumber?: number | null;
    organization?: {
      __typename?: "BountyOrganization";
      id: string;
      name: string;
      logo?: string | null;
      slug?: string | null;
    } | null;
    project?: {
      __typename?: "BountyProject";
      id: string;
      title: string;
      description?: string | null;
    } | null;
    bountyWindow?: {
      __typename?: "BountyWindowType";
      id: string;
      name: string;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
    } | null;
    _count?: { __typename?: "BountyCount"; submissions: number } | null;
  }>;
};

export type ProjectBountiesQueryVariables = Exact<{
  projectId: Scalars["ID"]["input"];
}>;

export type ProjectBountiesQuery = {
  __typename?: "Query";
  projectBounties: Array<{
    __typename?: "Bounty";
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    rewardAmount: number;
    rewardCurrency: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    projectId?: string | null;
    bountyWindowId?: string | null;
    githubIssueUrl: string;
    githubIssueNumber?: number | null;
    organization?: {
      __typename?: "BountyOrganization";
      id: string;
      name: string;
      logo?: string | null;
      slug?: string | null;
    } | null;
    project?: {
      __typename?: "BountyProject";
      id: string;
      title: string;
      description?: string | null;
    } | null;
    bountyWindow?: {
      __typename?: "BountyWindowType";
      id: string;
      name: string;
      status: string;
      startDate?: string | null;
      endDate?: string | null;
    } | null;
    _count?: { __typename?: "BountyCount"; submissions: number } | null;
  }>;
};

export type BountyFieldsFragment = {
  __typename?: "Bounty";
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  rewardAmount: number;
  rewardCurrency: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  projectId?: string | null;
  bountyWindowId?: string | null;
  githubIssueUrl: string;
  githubIssueNumber?: number | null;
  organization?: {
    __typename?: "BountyOrganization";
    id: string;
    name: string;
    logo?: string | null;
    slug?: string | null;
  } | null;
  project?: {
    __typename?: "BountyProject";
    id: string;
    title: string;
    description?: string | null;
  } | null;
  bountyWindow?: {
    __typename?: "BountyWindowType";
    id: string;
    name: string;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
  _count?: { __typename?: "BountyCount"; submissions: number } | null;
};

export type SubmissionFieldsFragment = {
  __typename?: "BountySubmissionType";
  id: string;
  bountyId: string;
  submittedBy: string;
  githubPullRequestUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewComments?: string | null;
  paidAt?: string | null;
  rewardTransactionHash?: string | null;
  submittedByUser?: {
    __typename?: "BountySubmissionUser";
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
  reviewedByUser?: {
    __typename?: "BountySubmissionUser";
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
};

export type SubmissionFieldsWithContactFragment = {
  __typename?: "BountySubmissionType";
  id: string;
  bountyId: string;
  submittedBy: string;
  githubPullRequestUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewComments?: string | null;
  paidAt?: string | null;
  rewardTransactionHash?: string | null;
  submittedByUser?: {
    __typename?: "BountySubmissionUser";
    email?: string | null;
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
  reviewedByUser?: {
    __typename?: "BountySubmissionUser";
    email?: string | null;
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
};

export type SubmitToBountyMutationVariables = Exact<{
  input: CreateSubmissionInput;
}>;

export type SubmitToBountyMutation = {
  __typename?: "Mutation";
  submitToBounty: {
    __typename?: "BountySubmissionType";
    id: string;
    bountyId: string;
    submittedBy: string;
    githubPullRequestUrl?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    reviewComments?: string | null;
    paidAt?: string | null;
    rewardTransactionHash?: string | null;
    submittedByUser?: {
      __typename?: "BountySubmissionUser";
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
    reviewedByUser?: {
      __typename?: "BountySubmissionUser";
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
  };
};

export type ReviewSubmissionMutationVariables = Exact<{
  input: ReviewSubmissionInput;
}>;

export type ReviewSubmissionMutation = {
  __typename?: "Mutation";
  reviewSubmission: {
    __typename?: "BountySubmissionType";
    id: string;
    bountyId: string;
    submittedBy: string;
    githubPullRequestUrl?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    reviewComments?: string | null;
    paidAt?: string | null;
    rewardTransactionHash?: string | null;
    submittedByUser?: {
      __typename?: "BountySubmissionUser";
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
    reviewedByUser?: {
      __typename?: "BountySubmissionUser";
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
  };
};

export type MarkSubmissionPaidMutationVariables = Exact<{
  submissionId: Scalars["ID"]["input"];
  transactionHash: Scalars["String"]["input"];
}>;

export type MarkSubmissionPaidMutation = {
  __typename?: "Mutation";
  markSubmissionPaid: {
    __typename?: "BountySubmissionType";
    id: string;
    bountyId: string;
    submittedBy: string;
    githubPullRequestUrl?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    reviewComments?: string | null;
    paidAt?: string | null;
    rewardTransactionHash?: string | null;
    submittedByUser?: {
      __typename?: "BountySubmissionUser";
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
    reviewedByUser?: {
      __typename?: "BountySubmissionUser";
      id: string;
      name?: string | null;
      image?: string | null;
    } | null;
  };
};

export const BountyFieldsFragmentDoc = `
    fragment BountyFields on Bounty {
  id
  title
  description
  status
  type
  rewardAmount
  rewardCurrency
  createdAt
  updatedAt
  organizationId
  projectId
  bountyWindowId
  githubIssueUrl
  githubIssueNumber
  organization {
    id
    name
    logo
    slug
  }
  project {
    id
    title
    description
  }
  bountyWindow {
    id
    name
    status
    startDate
    endDate
  }
  _count {
    submissions
  }
}
    `;
export const SubmissionFieldsFragmentDoc = `
    fragment SubmissionFields on BountySubmissionType {
  id
  bountyId
  submittedBy
  submittedByUser {
    id
    name
    image
  }
  githubPullRequestUrl
  status
  createdAt
  updatedAt
  reviewedAt
  reviewedBy
  reviewedByUser {
    id
    name
    image
  }
  reviewComments
  paidAt
  rewardTransactionHash
}
    `;
export const SubmissionFieldsWithContactFragmentDoc = `
    fragment SubmissionFieldsWithContact on BountySubmissionType {
  ...SubmissionFields
  submittedByUser {
    email
  }
  reviewedByUser {
    email
  }
}
    ${SubmissionFieldsFragmentDoc}`;
export const CreateBountyDocument = `
    mutation CreateBounty($input: CreateBountyInput!) {
  createBounty(input: $input) {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useCreateBountyMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    CreateBountyMutation,
    TError,
    CreateBountyMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    CreateBountyMutation,
    TError,
    CreateBountyMutationVariables,
    TContext
  >({
    mutationKey: ["CreateBounty"],
    mutationFn: (variables?: CreateBountyMutationVariables) =>
      fetcher<CreateBountyMutation, CreateBountyMutationVariables>(
        CreateBountyDocument,
        variables,
      )(),
    ...options,
  });
};

export const UpdateBountyDocument = `
    mutation UpdateBounty($input: UpdateBountyInput!) {
  updateBounty(input: $input) {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useUpdateBountyMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    UpdateBountyMutation,
    TError,
    UpdateBountyMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    UpdateBountyMutation,
    TError,
    UpdateBountyMutationVariables,
    TContext
  >({
    mutationKey: ["UpdateBounty"],
    mutationFn: (variables?: UpdateBountyMutationVariables) =>
      fetcher<UpdateBountyMutation, UpdateBountyMutationVariables>(
        UpdateBountyDocument,
        variables,
      )(),
    ...options,
  });
};

export const DeleteBountyDocument = `
    mutation DeleteBounty($id: ID!) {
  deleteBounty(id: $id)
}
    `;

export const useDeleteBountyMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    DeleteBountyMutation,
    TError,
    DeleteBountyMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    DeleteBountyMutation,
    TError,
    DeleteBountyMutationVariables,
    TContext
  >({
    mutationKey: ["DeleteBounty"],
    mutationFn: (variables?: DeleteBountyMutationVariables) =>
      fetcher<DeleteBountyMutation, DeleteBountyMutationVariables>(
        DeleteBountyDocument,
        variables,
      )(),
    ...options,
  });
};

export const BountiesDocument = `
    query Bounties($query: BountyQueryInput) {
  bounties(query: $query) {
    bounties {
      ...BountyFields
    }
    total
    limit
    offset
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useBountiesQuery = <TData = BountiesQuery, TError = unknown>(
  variables?: BountiesQueryVariables,
  options?: Omit<UseQueryOptions<BountiesQuery, TError, TData>, "queryKey"> & {
    queryKey?: UseQueryOptions<BountiesQuery, TError, TData>["queryKey"];
  },
) => {
  return useQuery<BountiesQuery, TError, TData>({
    queryKey: variables === undefined ? ["Bounties"] : ["Bounties", variables],
    queryFn: fetcher<BountiesQuery, BountiesQueryVariables>(
      BountiesDocument,
      variables,
    ),
    ...options,
  });
};

useBountiesQuery.getKey = (variables?: BountiesQueryVariables) =>
  variables === undefined ? ["Bounties"] : ["Bounties", variables];

export const BountyDocument = `
    query Bounty($id: ID!) {
  bounty(id: $id) {
    ...BountyFields
    submissions {
      ...SubmissionFields
    }
  }
}
    ${BountyFieldsFragmentDoc}
${SubmissionFieldsFragmentDoc}`;

export const useBountyQuery = <TData = BountyQuery, TError = unknown>(
  variables: BountyQueryVariables,
  options?: Omit<UseQueryOptions<BountyQuery, TError, TData>, "queryKey"> & {
    queryKey?: UseQueryOptions<BountyQuery, TError, TData>["queryKey"];
  },
) => {
  return useQuery<BountyQuery, TError, TData>({
    queryKey: ["Bounty", variables],
    queryFn: fetcher<BountyQuery, BountyQueryVariables>(
      BountyDocument,
      variables,
    ),
    ...options,
  });
};

useBountyQuery.getKey = (variables: BountyQueryVariables) => [
  "Bounty",
  variables,
];

export const ActiveBountiesDocument = `
    query ActiveBounties {
  activeBounties {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useActiveBountiesQuery = <
  TData = ActiveBountiesQuery,
  TError = unknown,
>(
  variables?: ActiveBountiesQueryVariables,
  options?: Omit<
    UseQueryOptions<ActiveBountiesQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<ActiveBountiesQuery, TError, TData>["queryKey"];
  },
) => {
  return useQuery<ActiveBountiesQuery, TError, TData>({
    queryKey:
      variables === undefined
        ? ["ActiveBounties"]
        : ["ActiveBounties", variables],
    queryFn: fetcher<ActiveBountiesQuery, ActiveBountiesQueryVariables>(
      ActiveBountiesDocument,
      variables,
    ),
    ...options,
  });
};

useActiveBountiesQuery.getKey = (variables?: ActiveBountiesQueryVariables) =>
  variables === undefined ? ["ActiveBounties"] : ["ActiveBounties", variables];

export const OrganizationBountiesDocument = `
    query OrganizationBounties($organizationId: ID!) {
  organizationBounties(organizationId: $organizationId) {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useOrganizationBountiesQuery = <
  TData = OrganizationBountiesQuery,
  TError = unknown,
>(
  variables: OrganizationBountiesQueryVariables,
  options?: Omit<
    UseQueryOptions<OrganizationBountiesQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      OrganizationBountiesQuery,
      TError,
      TData
    >["queryKey"];
  },
) => {
  return useQuery<OrganizationBountiesQuery, TError, TData>({
    queryKey: ["OrganizationBounties", variables],
    queryFn: fetcher<
      OrganizationBountiesQuery,
      OrganizationBountiesQueryVariables
    >(OrganizationBountiesDocument, variables),
    ...options,
  });
};

useOrganizationBountiesQuery.getKey = (
  variables: OrganizationBountiesQueryVariables,
) => ["OrganizationBounties", variables];

export const ProjectBountiesDocument = `
    query ProjectBounties($projectId: ID!) {
  projectBounties(projectId: $projectId) {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useProjectBountiesQuery = <
  TData = ProjectBountiesQuery,
  TError = unknown,
>(
  variables: ProjectBountiesQueryVariables,
  options?: Omit<
    UseQueryOptions<ProjectBountiesQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<ProjectBountiesQuery, TError, TData>["queryKey"];
  },
) => {
  return useQuery<ProjectBountiesQuery, TError, TData>({
    queryKey: ["ProjectBounties", variables],
    queryFn: fetcher<ProjectBountiesQuery, ProjectBountiesQueryVariables>(
      ProjectBountiesDocument,
      variables,
    ),
    ...options,
  });
};

useProjectBountiesQuery.getKey = (variables: ProjectBountiesQueryVariables) => [
  "ProjectBounties",
  variables,
];

export const SubmitToBountyDocument = `
    mutation SubmitToBounty($input: CreateSubmissionInput!) {
  submitToBounty(input: $input) {
    ...SubmissionFields
  }
}
    ${SubmissionFieldsFragmentDoc}`;

export const useSubmitToBountyMutation = <TError = unknown, TContext = unknown>(
  options?: UseMutationOptions<
    SubmitToBountyMutation,
    TError,
    SubmitToBountyMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    SubmitToBountyMutation,
    TError,
    SubmitToBountyMutationVariables,
    TContext
  >({
    mutationKey: ["SubmitToBounty"],
    mutationFn: (variables?: SubmitToBountyMutationVariables) =>
      fetcher<SubmitToBountyMutation, SubmitToBountyMutationVariables>(
        SubmitToBountyDocument,
        variables,
      )(),
    ...options,
  });
};

export const ReviewSubmissionDocument = `
    mutation ReviewSubmission($input: ReviewSubmissionInput!) {
  reviewSubmission(input: $input) {
    ...SubmissionFields
  }
}
    ${SubmissionFieldsFragmentDoc}`;

export const useReviewSubmissionMutation = <
  TError = unknown,
  TContext = unknown,
>(
  options?: UseMutationOptions<
    ReviewSubmissionMutation,
    TError,
    ReviewSubmissionMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    ReviewSubmissionMutation,
    TError,
    ReviewSubmissionMutationVariables,
    TContext
  >({
    mutationKey: ["ReviewSubmission"],
    mutationFn: (variables?: ReviewSubmissionMutationVariables) =>
      fetcher<ReviewSubmissionMutation, ReviewSubmissionMutationVariables>(
        ReviewSubmissionDocument,
        variables,
      )(),
    ...options,
  });
};

export const MarkSubmissionPaidDocument = `
    mutation MarkSubmissionPaid($submissionId: ID!, $transactionHash: String!) {
  markSubmissionPaid(
    submissionId: $submissionId
    transactionHash: $transactionHash
  ) {
    ...SubmissionFields
  }
}
    ${SubmissionFieldsFragmentDoc}`;

export const useMarkSubmissionPaidMutation = <
  TError = unknown,
  TContext = unknown,
>(
  options?: UseMutationOptions<
    MarkSubmissionPaidMutation,
    TError,
    MarkSubmissionPaidMutationVariables,
    TContext
  >,
) => {
  return useMutation<
    MarkSubmissionPaidMutation,
    TError,
    MarkSubmissionPaidMutationVariables,
    TContext
  >({
    mutationKey: ["MarkSubmissionPaid"],
    mutationFn: (variables?: MarkSubmissionPaidMutationVariables) =>
      fetcher<MarkSubmissionPaidMutation, MarkSubmissionPaidMutationVariables>(
        MarkSubmissionPaidDocument,
        variables,
      )(),
    ...options,
  });
};
