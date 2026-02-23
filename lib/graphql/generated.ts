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
  bountyWindow?: Maybe<BountyWindow>;
  bountyWindowId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  description: Scalars['String']['output'];
  githubIssueNumber?: Maybe<Scalars['Int']['output']>;
  githubIssueUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  projectId: Scalars['String']['output'];
  rewardAmount: Scalars['Float']['output'];
  rewardCurrency: Scalars['String']['output'];
  status: Scalars['String']['output'];
  submissions?: Maybe<Array<BountySubmission>>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BountyCount = {
  __typename?: 'BountyCount';
  submissions: Scalars['Int']['output'];
};

export type BountyQueryDto = {
  bountyWindowId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
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

export type BountySubmission = {
  __typename?: 'BountySubmission';
  bountyId: Scalars['String']['output'];
  comments?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  githubPullRequestUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  reviewComments?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  rewardTransactionHash?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  submittedBy: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum BountyType {
  Competition = 'COMPETITION',
  FixedPrice = 'FIXED_PRICE',
  MilestoneBased = 'MILESTONE_BASED'
}

export type BountyWindow = {
  __typename?: 'BountyWindow';
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
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
  activeBounties: Array<Bounty>;
  bounties: PaginatedBounties;
  bounty: Bounty;
  projectBounties: Array<Bounty>;
};


export type QueryBountiesArgs = {
  query?: InputMaybe<BountyQueryDto>;
};


export type QueryBountyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectBountiesArgs = {
  projectId: Scalars['ID']['input'];
};


