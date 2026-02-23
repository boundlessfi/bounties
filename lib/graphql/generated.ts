export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type Bounty = {
  __typename?: 'Bounty';
  _count?: Maybe<BountyCount>;
  bountyWindow?: Maybe<BountyWindowType>;
  bountyWindowId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  description: Scalars['String']['output'];
  githubIssueNumber?: Maybe<Scalars['Int']['output']>;
  githubIssueUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  organization?: Maybe<BountyOrganization>;
  organizationId: Scalars['String']['output'];
  project?: Maybe<BountyProject>;
  projectId?: Maybe<Scalars['String']['output']>;
  rewardAmount: Scalars['Float']['output'];
  rewardCurrency: Scalars['String']['output'];
  status: Scalars['String']['output'];
  submissions?: Maybe<Array<BountySubmissionType>>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BountyCount = {
  __typename?: 'BountyCount';
  submissions: Scalars['Int']['output'];
};

export type BountyOrganization = {
  __typename?: 'BountyOrganization';
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
};

export type BountyProject = {
  __typename?: 'BountyProject';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type BountyQueryInput = {
  bountyWindowId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BountyStatus>;
  type?: InputMaybe<BountyType>;
};

export enum BountyStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Disputed = 'DISPUTED',
  Draft = 'DRAFT',
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Submitted = 'SUBMITTED',
  UnderReview = 'UNDER_REVIEW'
}

export type BountySubmissionType = {
  __typename?: 'BountySubmissionType';
  bountyId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  githubPullRequestUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  reviewComments?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  reviewedByUser?: Maybe<BountySubmissionUser>;
  rewardTransactionHash?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  submittedBy: Scalars['String']['output'];
  submittedByUser?: Maybe<BountySubmissionUser>;
  updatedAt: Scalars['DateTime']['output'];
};

export type BountySubmissionUser = {
  __typename?: 'BountySubmissionUser';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export enum BountyType {
  Competition = 'COMPETITION',
  FixedPrice = 'FIXED_PRICE',
  MilestoneBased = 'MILESTONE_BASED'
}

export type BountyWindowType = {
  __typename?: 'BountyWindowType';
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
};

export type CreateBountyInput = {
  bountyWindowId?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  githubIssueNumber?: InputMaybe<Scalars['Int']['input']>;
  githubIssueUrl: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  rewardAmount: Scalars['Float']['input'];
  rewardCurrency: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: BountyType;
};

export type CreateSubmissionInput = {
  bountyId: Scalars['String']['input'];
  comments?: InputMaybe<Scalars['String']['input']>;
  githubPullRequestUrl: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new bounty (organization members only) */
  createBounty: Bounty;
  /** Delete a bounty (organization admins/owners only) */
  deleteBounty: Scalars['Boolean']['output'];
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
  id: Scalars['ID']['input'];
};


export type MutationMarkSubmissionPaidArgs = {
  submissionId: Scalars['ID']['input'];
  transactionHash: Scalars['String']['input'];
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
  __typename?: 'PaginatedBounties';
  bounties: Array<Bounty>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
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
  id: Scalars['ID']['input'];
};


export type QueryOrganizationBountiesArgs = {
  organizationId: Scalars['ID']['input'];
};


export type QueryProjectBountiesArgs = {
  projectId: Scalars['ID']['input'];
};

export type ReviewSubmissionInput = {
  reviewComments?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  submissionId: Scalars['ID']['input'];
};

export type UpdateBountyInput = {
  bountyWindowId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  githubIssueNumber?: InputMaybe<Scalars['Int']['input']>;
  githubIssueUrl?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  rewardAmount?: InputMaybe<Scalars['Float']['input']>;
  rewardCurrency?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<BountyType>;
};


