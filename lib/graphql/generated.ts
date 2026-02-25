import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { fetcher } from './client';
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

export type AdminAddDisputeNoteDto = {
  isInternal?: InputMaybe<Scalars['Boolean']['input']>;
  message: Scalars['String']['input'];
};

export type AdminAddMilestoneReviewNoteDto = {
  note: Scalars['String']['input'];
};

export type AdminApproveMilestoneDto = {
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type AdminAssignDisputeDto = {
  adminId: Scalars['String']['input'];
};

export type AdminBlogAuthorObject = {
  __typename?: 'AdminBlogAuthorObject';
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type AdminBlogMetaDto = {
  __typename?: 'AdminBlogMetaDto';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminBlogPostDto = {
  __typename?: 'AdminBlogPostDto';
  author: AdminBlogAuthorObject;
  categories: Array<Scalars['String']['output']>;
  content: Scalars['String']['output'];
  coverImage?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  excerpt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isFeatured: Scalars['Boolean']['output'];
  isPinned: Scalars['Boolean']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readingTime: Scalars['Int']['output'];
  scheduledFor?: Maybe<Scalars['DateTime']['output']>;
  slug: Scalars['String']['output'];
  status: BlogPostStatus;
  tags: Array<AdminBlogPostTagObject>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  viewCount: Scalars['Int']['output'];
};

export type AdminBlogPostTagObject = {
  __typename?: 'AdminBlogPostTagObject';
  tag: AdminBlogTagObject;
};

export type AdminBlogPostsResponseDto = {
  __typename?: 'AdminBlogPostsResponseDto';
  data: Array<AdminBlogPostDto>;
  meta: AdminBlogMetaDto;
};

export type AdminBlogTagObject = {
  __typename?: 'AdminBlogTagObject';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type AdminCampaignDto = {
  __typename?: 'AdminCampaignDto';
  createdAt: Scalars['DateTime']['output'];
  currentFunding: Scalars['Float']['output'];
  fundingGoal: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  shortDescription?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export enum AdminChangeType {
  Negative = 'NEGATIVE',
  Neutral = 'NEUTRAL',
  Positive = 'POSITIVE'
}

export type AdminChartDataPoint = {
  __typename?: 'AdminChartDataPoint';
  /** Crowdfunding value */
  crowdfunding: Scalars['Int']['output'];
  /** Date in ISO format */
  date: Scalars['String']['output'];
  /** Hackathons value */
  hackathons: Scalars['Int']['output'];
};

export type AdminCrowdfundingAssignDto = {
  reviewerId: Scalars['String']['input'];
};

export type AdminCrowdfundingListQueryDto = {
  assignedReviewerId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};

export type AdminCrowdfundingNoteDto = {
  note: Scalars['String']['input'];
};

export type AdminCrowdfundingPaginationDto = {
  __typename?: 'AdminCrowdfundingPaginationDto';
  hasNext: Scalars['Boolean']['output'];
  hasPrev: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminCrowdfundingRejectDto = {
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type AdminCrowdfundingRequestRevisionDto = {
  message: Scalars['String']['input'];
  reasons?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AdminCrowdfundingResponseDto = {
  __typename?: 'AdminCrowdfundingResponseDto';
  data: Array<AdminCampaignDto>;
  pagination: AdminCrowdfundingPaginationDto;
};

export type AdminDisputeDto = {
  __typename?: 'AdminDisputeDto';
  campaignId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  milestoneId?: Maybe<Scalars['String']['output']>;
  reason: DisputeReasonEnum;
  resolution?: Maybe<Scalars['String']['output']>;
  status: DisputeStatusEnum;
};

export type AdminDisputeMetaDto = {
  __typename?: 'AdminDisputeMetaDto';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminDisputeQueryDto = {
  campaignId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<DisputeStatusEnum>;
};

export type AdminDisputeResponseDto = {
  __typename?: 'AdminDisputeResponseDto';
  data: Array<AdminDisputeDto>;
  meta: AdminDisputeMetaDto;
};

export type AdminEscalateDisputeDto = {
  reason: Scalars['String']['input'];
};

export type AdminEscrowInfoDto = {
  __typename?: 'AdminEscrowInfoDto';
  escrowBalance: Scalars['Float']['output'];
  escrowContractAddress?: Maybe<Scalars['String']['output']>;
  escrowStatus: Scalars['String']['output'];
  transactions: Array<AdminEscrowTransactionDto>;
};

export type AdminEscrowTransactionDto = {
  __typename?: 'AdminEscrowTransactionDto';
  amount: Scalars['Float']['output'];
  campaignId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  toAddress?: Maybe<Scalars['String']['output']>;
  transactionHash?: Maybe<Scalars['String']['output']>;
  transactionType: Scalars['String']['output'];
};

export type AdminHackathonCountDto = {
  __typename?: 'AdminHackathonCountDto';
  jury?: Maybe<Scalars['Int']['output']>;
  participants: Scalars['Int']['output'];
  submissions: Scalars['Int']['output'];
};

export type AdminHackathonDto = {
  __typename?: 'AdminHackathonDto';
  _count: AdminHackathonCountDto;
  banner?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Array<Scalars['String']['output']>>;
  city?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  discord?: Maybe<Scalars['String']['output']>;
  enabledTabs: Array<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  escrow?: Maybe<AdminHackathonEscrowDto>;
  escrowAddress?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  judgingCriteria?: Maybe<Scalars['String']['output']>;
  judgingEnd?: Maybe<Scalars['DateTime']['output']>;
  judgingStart?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  organization: AdminHackathonOrganizationDto;
  participantType?: Maybe<Scalars['String']['output']>;
  participants: Array<AdminUserDto>;
  phases?: Maybe<Scalars['String']['output']>;
  prizePool: Scalars['Float']['output'];
  prizeTiers?: Maybe<Scalars['String']['output']>;
  registrationDeadline?: Maybe<Scalars['DateTime']['output']>;
  requireDemoVideo: Scalars['Boolean']['output'];
  requireGithub: Scalars['Boolean']['output'];
  requireOtherLinks: Scalars['Boolean']['output'];
  rules?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  socialLinks: Array<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status: HackathonStatus;
  submissionDeadline?: Maybe<Scalars['DateTime']['output']>;
  submissionStatusVisibility: Scalars['String']['output'];
  submissionVisibility: Scalars['String']['output'];
  submissions: Array<AdminHackathonSubmissionDto>;
  tagline?: Maybe<Scalars['String']['output']>;
  teamMax?: Maybe<Scalars['Int']['output']>;
  teamMin?: Maybe<Scalars['Int']['output']>;
  telegram?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  venueAddress?: Maybe<Scalars['String']['output']>;
  venueName?: Maybe<Scalars['String']['output']>;
  venueType?: Maybe<Scalars['String']['output']>;
  winnersAnnouncedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AdminHackathonEscrowDto = {
  __typename?: 'AdminHackathonEscrowDto';
  remaining: Scalars['Float']['output'];
  totalLocked: Scalars['Float']['output'];
  totalReleased: Scalars['Float']['output'];
  transactions: Array<AdminHackathonEscrowTransactionDto>;
};

export type AdminHackathonEscrowTransactionDto = {
  __typename?: 'AdminHackathonEscrowTransactionDto';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  participantId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  transactionHash?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type AdminHackathonMetricData = {
  __typename?: 'AdminHackathonMetricData';
  /** Additional hackathon info */
  additionalInfo?: Maybe<Scalars['String']['output']>;
  /** Percentage change */
  change: Scalars['Float']['output'];
  /** Type of change */
  changeType: AdminChangeType;
  /** Additional description */
  description?: Maybe<Scalars['String']['output']>;
  /** Metric label */
  label: Scalars['String']['output'];
  /** The metric value */
  value: Scalars['Int']['output'];
};

export type AdminHackathonOrganizationDto = {
  __typename?: 'AdminHackathonOrganizationDto';
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type AdminHackathonPaginationDto = {
  __typename?: 'AdminHackathonPaginationDto';
  hasNext: Scalars['Boolean']['output'];
  hasPrev: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminHackathonQueryDto = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<HackathonStatus>;
};

export type AdminHackathonSubmissionDto = {
  __typename?: 'AdminHackathonSubmissionDto';
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  participant: AdminUserDto;
  projectName: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  videoUrl?: Maybe<Scalars['String']['output']>;
};

export type AdminHackathonsResponseDto = {
  __typename?: 'AdminHackathonsResponseDto';
  data: Array<AdminHackathonDto>;
  pagination: AdminHackathonPaginationDto;
};

export type AdminManualEscrowActionDto = {
  action: EscrowActionType;
  amount?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  recipientAddress?: InputMaybe<Scalars['String']['input']>;
};

export type AdminMetricData = {
  __typename?: 'AdminMetricData';
  /** Percentage change */
  change: Scalars['Float']['output'];
  /** Type of change */
  changeType: AdminChangeType;
  /** Additional description */
  description?: Maybe<Scalars['String']['output']>;
  /** Metric label */
  label: Scalars['String']['output'];
  /** The metric value */
  value: Scalars['Int']['output'];
};

export type AdminMilestoneCampaignDto = {
  __typename?: 'AdminMilestoneCampaignDto';
  fundingGoal: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type AdminMilestoneDto = {
  __typename?: 'AdminMilestoneDto';
  campaign: AdminMilestoneCampaignDto;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reviewStatus: MilestoneReviewStatusEnum;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
};

export type AdminMilestoneMetaDto = {
  __typename?: 'AdminMilestoneMetaDto';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminMilestoneQueryDto = {
  campaignId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<MilestoneSortByEnum>;
  status?: InputMaybe<MilestoneReviewStatusEnum>;
};

export type AdminMilestonesResponseDto = {
  __typename?: 'AdminMilestonesResponseDto';
  data: Array<AdminMilestoneDto>;
  meta: AdminMilestoneMetaDto;
};

export type AdminOrganizationCountDto = {
  __typename?: 'AdminOrganizationCountDto';
  hackathons: Scalars['Int']['output'];
  invitations: Scalars['Int']['output'];
  members: Scalars['Int']['output'];
  projects: Scalars['Int']['output'];
};

export type AdminOrganizationDto = {
  __typename?: 'AdminOrganizationDto';
  _count: AdminOrganizationCountDto;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  members: Array<AdminOrganizationMemberDto>;
  name: Scalars['String']['output'];
  slug?: Maybe<Scalars['String']['output']>;
};

export type AdminOrganizationMemberDto = {
  __typename?: 'AdminOrganizationMemberDto';
  id: Scalars['String']['output'];
  role: Scalars['String']['output'];
  user: AdminOrganizationMemberUserDto;
};

export type AdminOrganizationMemberUserDto = {
  __typename?: 'AdminOrganizationMemberUserDto';
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type AdminOrganizationPaginationDto = {
  __typename?: 'AdminOrganizationPaginationDto';
  hasNext: Scalars['Boolean']['output'];
  hasPrev: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminOrganizationsResponseDto = {
  __typename?: 'AdminOrganizationsResponseDto';
  data: Array<AdminOrganizationDto>;
  pagination: AdminOrganizationPaginationDto;
};

export type AdminOverviewChartData = {
  __typename?: 'AdminOverviewChartData';
  data: Array<AdminChartDataPoint>;
  /** Time range for the chart */
  timeRange: AdminTimeRange;
};

export type AdminOverviewMetrics = {
  __typename?: 'AdminOverviewMetrics';
  hackathons: AdminHackathonMetricData;
  organizations: AdminMetricData;
  projects: AdminMetricData;
  totalUsers: AdminMetricData;
};

export type AdminOverviewQueryDto = {
  timeRange?: InputMaybe<AdminTimeRange>;
};

export type AdminOverviewResponse = {
  __typename?: 'AdminOverviewResponse';
  chart: AdminOverviewChartData;
  /** Last updated timestamp */
  lastUpdated: Scalars['String']['output'];
  metrics: AdminOverviewMetrics;
};

export type AdminRejectMilestoneDto = {
  feedback: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  resubmissionDeadline?: InputMaybe<Scalars['String']['input']>;
};

export type AdminRequestMilestoneResubmissionDto = {
  feedback: Scalars['String']['input'];
  resubmissionDeadline: Scalars['String']['input'];
};

export type AdminResolveDisputeDto = {
  resolution: DisputeResolutionEnum;
  resolutionNotes: Scalars['String']['input'];
};

export type AdminRewardDistributionResponseDto = {
  __typename?: 'AdminRewardDistributionResponseDto';
  adminDecisionAt?: Maybe<Scalars['DateTime']['output']>;
  adminNote?: Maybe<Scalars['String']['output']>;
  adminUserId?: Maybe<Scalars['String']['output']>;
  distributionId?: Maybe<Scalars['ID']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  snapshot: AdminRewardDistributionSnapshot;
  status: RewardDistributionStatus;
  triggeredAt: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type AdminRewardDistributionSnapshot = {
  __typename?: 'AdminRewardDistributionSnapshot';
  currency: Scalars['String']['output'];
  escrowAddress: Scalars['String']['output'];
  idempotencyKey: Scalars['ID']['output'];
  organizerNote?: Maybe<Scalars['String']['output']>;
  platformFee: Scalars['Float']['output'];
  snapshotAt: Scalars['String']['output'];
  totalPrizePool: Scalars['Float']['output'];
  totalRequired: Scalars['Float']['output'];
  winners: Array<AdminWinnerSnapshot>;
  winnersChecksum: Scalars['String']['output'];
};

export type AdminRewardQueueItemDto = {
  __typename?: 'AdminRewardQueueItemDto';
  adminNote?: Maybe<Scalars['String']['output']>;
  distributionId: Scalars['ID']['output'];
  hackathonId: Scalars['ID']['output'];
  hackathonName: Scalars['String']['output'];
  organizationId: Scalars['ID']['output'];
  organizationName: Scalars['String']['output'];
  status: RewardDistributionStatus;
  totalRequired: Scalars['Float']['output'];
  triggeredAt: Scalars['String']['output'];
  triggeredByUserId: Scalars['ID']['output'];
  winnerCount: Scalars['Int']['output'];
};

export type AdminRewardQueueResponseDto = {
  __typename?: 'AdminRewardQueueResponseDto';
  items: Array<AdminRewardQueueItemDto>;
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum AdminTimeRange {
  NinetyDays = 'NINETY_DAYS',
  SevenDays = 'SEVEN_DAYS',
  ThirtyDays = 'THIRTY_DAYS'
}

export type AdminUserCountDto = {
  __typename?: 'AdminUserCountDto';
  activities: Scalars['Int']['output'];
  comments: Scalars['Int']['output'];
  projects: Scalars['Int']['output'];
  votes: Scalars['Int']['output'];
};

export type AdminUserDto = {
  __typename?: 'AdminUserDto';
  _count: AdminUserCountDto;
  banned?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastLoginMethod?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type AdminUserPaginationDto = {
  __typename?: 'AdminUserPaginationDto';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type AdminUsersResponseDto = {
  __typename?: 'AdminUsersResponseDto';
  pagination: AdminUserPaginationDto;
  users: Array<AdminUserDto>;
};

export type AdminWinnerSnapshot = {
  __typename?: 'AdminWinnerSnapshot';
  prizeAmount: Scalars['Float']['output'];
  prizeTierName: Scalars['String']['output'];
  rank: Scalars['Int']['output'];
  submissionId: Scalars['ID']['output'];
  submissionTitle: Scalars['String']['output'];
  walletAddresses: Scalars['String']['output'];
};

export type ApproveRewardDistributionDto = {
  adminNote?: InputMaybe<Scalars['String']['input']>;
};

export type BlogPostQueryDto = {
  authorId?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Scalars['String']['input']>;
  includePinned?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BlogPostStatus>;
  tags?: InputMaybe<Scalars['String']['input']>;
};

export enum BlogPostStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Scheduled = 'SCHEDULED'
}

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

export type ContactOrganizersInput = {
  message: Scalars['String']['input'];
  subject: Scalars['String']['input'];
};

export type ContributorStats = {
  __typename?: 'ContributorStats';
  averageCompletionTime: Scalars['Float']['output'];
  completionRate: Scalars['Float']['output'];
  currentStreak: Scalars['Int']['output'];
  currentTierPoints?: Maybe<Scalars['Float']['output']>;
  earningsCurrency: Scalars['String']['output'];
  longestStreak: Scalars['Int']['output'];
  nextTierThreshold?: Maybe<Scalars['Float']['output']>;
  totalCompleted: Scalars['Int']['output'];
  totalEarnings: Scalars['Float']['output'];
};

export type CreateBlogPostDto = {
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  content: Scalars['String']['input'];
  coverImage?: InputMaybe<Scalars['String']['input']>;
  excerpt?: InputMaybe<Scalars['String']['input']>;
  generateAI?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  readingTime?: InputMaybe<Scalars['Float']['input']>;
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BlogPostStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
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

export enum DisputeReasonEnum {
  CommunicationIssues = 'COMMUNICATION_ISSUES',
  DeadlineMissed = 'DEADLINE_MISSED',
  MilestoneNotDelivered = 'MILESTONE_NOT_DELIVERED',
  MisuseOfFunds = 'MISUSE_OF_FUNDS',
  Other = 'OTHER',
  PoorQualityWork = 'POOR_QUALITY_WORK',
  ScopeChange = 'SCOPE_CHANGE'
}

export enum DisputeResolutionEnum {
  ApprovedWithConditions = 'APPROVED_WITH_CONDITIONS',
  Arbitration = 'ARBITRATION',
  Dismissed = 'DISMISSED',
  FullRefund = 'FULL_REFUND',
  PartialRefund = 'PARTIAL_REFUND',
  RequireResubmission = 'REQUIRE_RESUBMISSION'
}

export enum DisputeStatusEnum {
  AwaitingResponse = 'AWAITING_RESPONSE',
  Closed = 'CLOSED',
  Escalated = 'ESCALATED',
  Open = 'OPEN',
  Resolved = 'RESOLVED',
  UnderReview = 'UNDER_REVIEW'
}

export type EmailActionResponseDto = {
  __typename?: 'EmailActionResponseDto';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  totalSent?: Maybe<Scalars['Int']['output']>;
};

export type EmailParticipantsInput = {
  message: Scalars['String']['input'];
  subject: Scalars['String']['input'];
  targetGroup: Scalars['String']['input'];
};

export enum EscrowActionType {
  Pause = 'PAUSE',
  Refund = 'REFUND',
  Release = 'RELEASE',
  Resume = 'RESUME'
}

export enum HackathonStatus {
  Archived = 'ARCHIVED',
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type LeaderboardContributor = {
  __typename?: 'LeaderboardContributor';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastActiveAt: Scalars['DateTime']['output'];
  stats: ContributorStats;
  tier: ReputationTier;
  topTags: Array<Scalars['String']['output']>;
  totalScore: Scalars['Float']['output'];
  userId: Scalars['String']['output'];
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type LeaderboardEntry = {
  __typename?: 'LeaderboardEntry';
  contributor: LeaderboardContributor;
  previousRank?: Maybe<Scalars['Int']['output']>;
  rank: Scalars['Int']['output'];
  rankChange?: Maybe<Scalars['Int']['output']>;
};

export type LeaderboardFilters = {
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  tier?: InputMaybe<ReputationTier>;
  timeframe: LeaderboardTimeframe;
};

export type LeaderboardPagination = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
};

export type LeaderboardResponse = {
  __typename?: 'LeaderboardResponse';
  currentUserRank?: Maybe<Scalars['Int']['output']>;
  entries: Array<LeaderboardEntry>;
  lastUpdatedAt: Scalars['DateTime']['output'];
  totalCount: Scalars['Int']['output'];
};

export enum LeaderboardTimeframe {
  AllTime = 'ALL_TIME',
  ThisMonth = 'THIS_MONTH',
  ThisWeek = 'THIS_WEEK'
}

export enum MilestoneReviewStatusEnum {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  ResubmissionRequired = 'RESUBMISSION_REQUIRED',
  Submitted = 'SUBMITTED',
  UnderReview = 'UNDER_REVIEW'
}

export enum MilestoneSortByEnum {
  CampaignSize = 'CAMPAIGN_SIZE',
  CreatorReputation = 'CREATOR_REPUTATION',
  Date = 'DATE',
  SubmittedAt = 'SUBMITTED_AT'
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Add an admin review note for a campaign (Admin only) */
  addCrowdfundingReviewNote: Scalars['Boolean']['output'];
  /** Add a note or message to a dispute (Admin only) */
  addDisputeNote: Scalars['Boolean']['output'];
  /** Add a review note to a milestone (Admin only) */
  addMilestoneReviewNote: Scalars['Boolean']['output'];
  /** Approve a crowdfunding campaign (Admin only) */
  approveCrowdfundingCampaign: AdminCampaignDto;
  /** Approve a milestone submission (Admin only) */
  approveMilestone: AdminMilestoneDto;
  /** Approve reward distribution (Admin only) */
  approveRewardDistribution: AdminRewardDistributionResponseDto;
  /** Assign a reviewer to a campaign (Admin only) */
  assignCrowdfundingReviewer: Scalars['Boolean']['output'];
  /** Assign a dispute to an admin (Admin only) */
  assignDispute: AdminDisputeDto;
  /** Contact hackathon organizers (Admin only) */
  contactOrganizers: EmailActionResponseDto;
  /** Create a new blog post (Admin only) */
  createAdminBlogPost: AdminBlogPostDto;
  /** Create a new bounty (organization members only) */
  createBounty: Bounty;
  /** Soft delete a blog post (Admin only) */
  deleteAdminBlogPost: Scalars['Boolean']['output'];
  /** Delete a bounty (organization admins/owners only) */
  deleteBounty: Scalars['Boolean']['output'];
  /** Delete all unused tags (Admin only) */
  deleteUnusedBlogTags: Scalars['Int']['output'];
  /** Send email to hackathon participants (Admin only) */
  emailParticipants: EmailActionResponseDto;
  /** Escalate a dispute to arbitration (Admin only) */
  escalateDispute: AdminDisputeDto;
  /** Execute a manual escrow action (Admin only) */
  executeManualEscrowAction: AdminEscrowTransactionDto;
  /** Mark a submission as paid (organization admins/owners only) */
  markSubmissionPaid: BountySubmissionType;
  /** Permanently delete a blog post (Admin only) */
  permanentlyDeleteAdminBlogPost: Scalars['Boolean']['output'];
  /** Manually trigger publishing of scheduled posts (Admin only) */
  publishScheduledBlogPosts: Scalars['Int']['output'];
  /** Reject a crowdfunding campaign (Admin only) */
  rejectCrowdfundingCampaign: Scalars['Boolean']['output'];
  /** Reject a milestone submission (Admin only) */
  rejectMilestone: AdminMilestoneDto;
  /** Reject reward distribution (Admin only) */
  rejectRewardDistribution: AdminRewardDistributionResponseDto;
  /** Request revisions for a crowdfunding campaign (Admin only) */
  requestCrowdfundingRevision: Scalars['Boolean']['output'];
  /** Request resubmission of a milestone (Admin only) */
  requestMilestoneResubmission: AdminMilestoneDto;
  /** Resolve a dispute (Admin only) */
  resolveDispute: AdminDisputeDto;
  /** Restore a soft-deleted blog post (Admin only) */
  restoreAdminBlogPost: AdminBlogPostDto;
  /** Review a bounty submission (organization members only) */
  reviewSubmission: BountySubmissionType;
  /** Submit to a bounty (any authenticated user) */
  submitToBounty: BountySubmissionType;
  /** Update a blog post (Admin only) */
  updateAdminBlogPost: AdminBlogPostDto;
  /** Update an existing bounty (organization members only) */
  updateBounty: Bounty;
  /** Update hackathon status (Admin only) */
  updateHackathonStatus: AdminHackathonDto;
};


export type MutationAddCrowdfundingReviewNoteArgs = {
  id: Scalars['ID']['input'];
  input: AdminCrowdfundingNoteDto;
};


export type MutationAddDisputeNoteArgs = {
  id: Scalars['ID']['input'];
  input: AdminAddDisputeNoteDto;
};


export type MutationAddMilestoneReviewNoteArgs = {
  id: Scalars['ID']['input'];
  input: AdminAddMilestoneReviewNoteDto;
};


export type MutationApproveCrowdfundingCampaignArgs = {
  id: Scalars['ID']['input'];
};


export type MutationApproveMilestoneArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<AdminApproveMilestoneDto>;
};


export type MutationApproveRewardDistributionArgs = {
  distributionId: Scalars['ID']['input'];
  hackathonId: Scalars['ID']['input'];
  input?: InputMaybe<ApproveRewardDistributionDto>;
};


export type MutationAssignCrowdfundingReviewerArgs = {
  id: Scalars['ID']['input'];
  input: AdminCrowdfundingAssignDto;
};


export type MutationAssignDisputeArgs = {
  id: Scalars['ID']['input'];
  input: AdminAssignDisputeDto;
};


export type MutationContactOrganizersArgs = {
  id: Scalars['ID']['input'];
  input: ContactOrganizersInput;
};


export type MutationCreateAdminBlogPostArgs = {
  input: CreateBlogPostDto;
};


export type MutationCreateBountyArgs = {
  input: CreateBountyInput;
};


export type MutationDeleteAdminBlogPostArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBountyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEmailParticipantsArgs = {
  id: Scalars['ID']['input'];
  input: EmailParticipantsInput;
};


export type MutationEscalateDisputeArgs = {
  id: Scalars['ID']['input'];
  input: AdminEscalateDisputeDto;
};


export type MutationExecuteManualEscrowActionArgs = {
  campaignId: Scalars['ID']['input'];
  input: AdminManualEscrowActionDto;
};


export type MutationMarkSubmissionPaidArgs = {
  submissionId: Scalars['ID']['input'];
  transactionHash: Scalars['String']['input'];
};


export type MutationPermanentlyDeleteAdminBlogPostArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRejectCrowdfundingCampaignArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<AdminCrowdfundingRejectDto>;
};


export type MutationRejectMilestoneArgs = {
  id: Scalars['ID']['input'];
  input: AdminRejectMilestoneDto;
};


export type MutationRejectRewardDistributionArgs = {
  distributionId: Scalars['ID']['input'];
  hackathonId: Scalars['ID']['input'];
  input: RejectRewardDistributionDto;
};


export type MutationRequestCrowdfundingRevisionArgs = {
  id: Scalars['ID']['input'];
  input: AdminCrowdfundingRequestRevisionDto;
};


export type MutationRequestMilestoneResubmissionArgs = {
  id: Scalars['ID']['input'];
  input: AdminRequestMilestoneResubmissionDto;
};


export type MutationResolveDisputeArgs = {
  id: Scalars['ID']['input'];
  input: AdminResolveDisputeDto;
};


export type MutationRestoreAdminBlogPostArgs = {
  id: Scalars['ID']['input'];
};


export type MutationReviewSubmissionArgs = {
  input: ReviewSubmissionInput;
};


export type MutationSubmitToBountyArgs = {
  input: CreateSubmissionInput;
};


export type MutationUpdateAdminBlogPostArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBlogPostDto;
};


export type MutationUpdateBountyArgs = {
  input: UpdateBountyInput;
};


export type MutationUpdateHackathonStatusArgs = {
  id: Scalars['ID']['input'];
  input: UpdateHackathonStatusInput;
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
  /** Get blog post by ID (Admin only) */
  adminBlogPost: AdminBlogPostDto;
  /** List all blog posts including drafts (Admin only) */
  adminBlogPosts: AdminBlogPostsResponseDto;
  /** Get all tags with post counts (Admin only) */
  adminBlogTags: Array<AdminBlogTagObject>;
  /** Get crowdfunding campaign by ID (Admin only) */
  adminCrowdfundingCampaign: AdminCampaignDto;
  /** List all crowdfunding campaigns (Admin only) */
  adminCrowdfundingCampaigns: AdminCrowdfundingResponseDto;
  /** Get detailed dispute information (Admin only) */
  adminDisputeDetail: AdminDisputeDto;
  /** List disputes with filtering (Admin only) */
  adminDisputes: AdminDisputeResponseDto;
  /** Get escrow info for a campaign (Admin only) */
  adminEscrowInfo: AdminEscrowInfoDto;
  /** Get hackathon detail (Admin only) */
  adminHackathonDetail: AdminHackathonDto;
  /** List all hackathons (Admin only) */
  adminHackathons: AdminHackathonsResponseDto;
  /** Get milestone details for review (Admin only) */
  adminMilestoneForReview: AdminMilestoneDto;
  /** Get all organizations with pagination and search */
  adminOrganizations: AdminOrganizationsResponseDto;
  /** Get admin overview data */
  adminOverview: AdminOverviewResponse;
  /** List crowdfunding campaigns pending admin review (Admin only) */
  adminPendingCrowdfundingCampaigns: AdminCrowdfundingResponseDto;
  /** List milestones pending admin review (Admin only) */
  adminPendingMilestones: AdminMilestonesResponseDto;
  /** Get reward distribution detail (Admin only) */
  adminRewardDistributionDetail: AdminRewardDistributionResponseDto;
  /** Get reward distribution queue (Admin only) */
  adminRewardQueue: AdminRewardQueueResponseDto;
  /** List crowdfunding campaigns by user (Admin only) */
  adminUserCrowdfundingCampaigns: AdminCrowdfundingResponseDto;
  /** Get all users with pagination and filtering */
  adminUsers: AdminUsersResponseDto;
  /** Get paginated list of bounties with filtering */
  bounties: PaginatedBounties;
  /** Get a single bounty by ID */
  bounty: Bounty;
  /** Get leaderboard with filtering and pagination */
  leaderboard: LeaderboardResponse;
  /** Get bounties for a specific organization */
  organizationBounties: Array<Bounty>;
  /** Get bounties for a specific project */
  projectBounties: Array<Bounty>;
  /** Get top contributors */
  topContributors: Array<LeaderboardContributor>;
  /** Get user's rank in leaderboard */
  userLeaderboardRank?: Maybe<UserLeaderboardRankResponse>;
};


export type QueryAdminBlogPostArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminBlogPostsArgs = {
  query?: InputMaybe<BlogPostQueryDto>;
};


export type QueryAdminBlogTagsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminCrowdfundingCampaignArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminCrowdfundingCampaignsArgs = {
  query?: InputMaybe<AdminCrowdfundingListQueryDto>;
};


export type QueryAdminDisputeDetailArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminDisputesArgs = {
  query?: InputMaybe<AdminDisputeQueryDto>;
};


export type QueryAdminEscrowInfoArgs = {
  campaignId: Scalars['ID']['input'];
};


export type QueryAdminHackathonDetailArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminHackathonsArgs = {
  query?: InputMaybe<AdminHackathonQueryDto>;
};


export type QueryAdminMilestoneForReviewArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAdminOrganizationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminOverviewArgs = {
  query?: InputMaybe<AdminOverviewQueryDto>;
};


export type QueryAdminPendingCrowdfundingCampaignsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminPendingMilestonesArgs = {
  query?: InputMaybe<AdminMilestoneQueryDto>;
};


export type QueryAdminRewardDistributionDetailArgs = {
  distributionId: Scalars['ID']['input'];
  hackathonId: Scalars['ID']['input'];
};


export type QueryAdminRewardQueueArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminUserCrowdfundingCampaignsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  usernameOrId: Scalars['String']['input'];
};


export type QueryAdminUsersArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBountiesArgs = {
  query?: InputMaybe<BountyQueryInput>;
};


export type QueryBountyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLeaderboardArgs = {
  filters: LeaderboardFilters;
  pagination: LeaderboardPagination;
};


export type QueryOrganizationBountiesArgs = {
  organizationId: Scalars['ID']['input'];
};


export type QueryProjectBountiesArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryTopContributorsArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserLeaderboardRankArgs = {
  userId: Scalars['ID']['input'];
};

export type RejectRewardDistributionDto = {
  adminNote?: InputMaybe<Scalars['String']['input']>;
  reason: Scalars['String']['input'];
};

export enum ReputationTier {
  Contributor = 'CONTRIBUTOR',
  Established = 'ESTABLISHED',
  Expert = 'EXPERT',
  Legend = 'LEGEND',
  Newcomer = 'NEWCOMER'
}

export type ReviewSubmissionInput = {
  reviewComments?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  submissionId: Scalars['ID']['input'];
};

export enum RewardDistributionStatus {
  Approved = 'APPROVED',
  Completed = 'COMPLETED',
  Executing = 'EXECUTING',
  Failed = 'FAILED',
  NotTriggered = 'NOT_TRIGGERED',
  PartialSuccess = 'PARTIAL_SUCCESS',
  PendingAdminReview = 'PENDING_ADMIN_REVIEW',
  Rejected = 'REJECTED'
}

export type UpdateBlogPostDto = {
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  content?: InputMaybe<Scalars['String']['input']>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  excerpt?: InputMaybe<Scalars['String']['input']>;
  generateAI?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  readingTime?: InputMaybe<Scalars['Float']['input']>;
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BlogPostStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
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

export type UpdateHackathonStatusInput = {
  status: HackathonStatus;
};

export type UserLeaderboardRankResponse = {
  __typename?: 'UserLeaderboardRankResponse';
  contributor: LeaderboardContributor;
  rank: Scalars['Int']['output'];
};

export type CreateBountyMutationVariables = Exact<{
  input: CreateBountyInput;
}>;


export type CreateBountyMutation = { __typename?: 'Mutation', createBounty: { __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null } };

export type UpdateBountyMutationVariables = Exact<{
  input: UpdateBountyInput;
}>;


export type UpdateBountyMutation = { __typename?: 'Mutation', updateBounty: { __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null } };

export type DeleteBountyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteBountyMutation = { __typename?: 'Mutation', deleteBounty: boolean };

export type BountiesQueryVariables = Exact<{
  query?: InputMaybe<BountyQueryInput>;
}>;


export type BountiesQuery = { __typename?: 'Query', bounties: { __typename?: 'PaginatedBounties', total: number, limit: number, offset: number, bounties: Array<{ __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null }> } };

export type BountyQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type BountyQuery = { __typename?: 'Query', bounty: { __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, submissions?: Array<{ __typename?: 'BountySubmissionType', id: string, bountyId: string, submittedBy: string, githubPullRequestUrl?: string | null, status: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedBy?: string | null, reviewComments?: string | null, paidAt?: string | null, rewardTransactionHash?: string | null, submittedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null, reviewedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null }> | null, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null } };

export type ActiveBountiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveBountiesQuery = { __typename?: 'Query', activeBounties: Array<{ __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null }> };

export type OrganizationBountiesQueryVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type OrganizationBountiesQuery = { __typename?: 'Query', organizationBounties: Array<{ __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null }> };

export type ProjectBountiesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectBountiesQuery = { __typename?: 'Query', projectBounties: Array<{ __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null }> };

export type BountyFieldsFragment = { __typename?: 'Bounty', id: string, title: string, description: string, status: string, type: string, rewardAmount: number, rewardCurrency: string, createdAt: string, updatedAt: string, organizationId: string, projectId?: string | null, bountyWindowId?: string | null, githubIssueUrl: string, githubIssueNumber?: number | null, createdBy: string, organization?: { __typename?: 'BountyOrganization', id: string, name: string, logo?: string | null, slug?: string | null } | null, project?: { __typename?: 'BountyProject', id: string, title: string, description?: string | null } | null, bountyWindow?: { __typename?: 'BountyWindowType', id: string, name: string, status: string, startDate?: string | null, endDate?: string | null } | null, _count?: { __typename?: 'BountyCount', submissions: number } | null };

export type SubmissionFieldsFragment = { __typename?: 'BountySubmissionType', id: string, bountyId: string, submittedBy: string, githubPullRequestUrl?: string | null, status: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedBy?: string | null, reviewComments?: string | null, paidAt?: string | null, rewardTransactionHash?: string | null, submittedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null, reviewedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null };

export type SubmissionFieldsWithContactFragment = { __typename?: 'BountySubmissionType', id: string, bountyId: string, submittedBy: string, githubPullRequestUrl?: string | null, status: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedBy?: string | null, reviewComments?: string | null, paidAt?: string | null, rewardTransactionHash?: string | null, submittedByUser?: { __typename?: 'BountySubmissionUser', email?: string | null, id: string, name?: string | null, image?: string | null } | null, reviewedByUser?: { __typename?: 'BountySubmissionUser', email?: string | null, id: string, name?: string | null, image?: string | null } | null };

export type LeaderboardQueryVariables = Exact<{
  filters: LeaderboardFilters;
  pagination: LeaderboardPagination;
}>;


export type LeaderboardQuery = { __typename?: 'Query', leaderboard: { __typename?: 'LeaderboardResponse', totalCount: number, currentUserRank?: number | null, lastUpdatedAt: string, entries: Array<{ __typename?: 'LeaderboardEntry', rank: number, previousRank?: number | null, rankChange?: number | null, contributor: { __typename?: 'LeaderboardContributor', id: string, userId: string, walletAddress?: string | null, displayName: string, avatarUrl?: string | null, totalScore: number, tier: ReputationTier, topTags: Array<string>, lastActiveAt: string, stats: { __typename?: 'ContributorStats', totalCompleted: number, totalEarnings: number, earningsCurrency: string, completionRate: number, averageCompletionTime: number, currentStreak: number, longestStreak: number, nextTierThreshold?: number | null, currentTierPoints?: number | null } } }> } };

export type UserLeaderboardRankQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type UserLeaderboardRankQuery = { __typename?: 'Query', userLeaderboardRank?: { __typename?: 'UserLeaderboardRankResponse', rank: number, contributor: { __typename?: 'LeaderboardContributor', id: string, userId: string, walletAddress?: string | null, displayName: string, avatarUrl?: string | null, totalScore: number, tier: ReputationTier, topTags: Array<string>, lastActiveAt: string, stats: { __typename?: 'ContributorStats', totalCompleted: number, totalEarnings: number, earningsCurrency: string, completionRate: number, averageCompletionTime: number, currentStreak: number, longestStreak: number, nextTierThreshold?: number | null, currentTierPoints?: number | null } } } | null };

export type TopContributorsQueryVariables = Exact<{
  count?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TopContributorsQuery = { __typename?: 'Query', topContributors: Array<{ __typename?: 'LeaderboardContributor', id: string, userId: string, walletAddress?: string | null, displayName: string, avatarUrl?: string | null, totalScore: number, tier: ReputationTier, topTags: Array<string>, lastActiveAt: string, stats: { __typename?: 'ContributorStats', totalCompleted: number, totalEarnings: number, earningsCurrency: string, completionRate: number, averageCompletionTime: number, currentStreak: number, longestStreak: number, nextTierThreshold?: number | null, currentTierPoints?: number | null } }> };

export type SubmitToBountyMutationVariables = Exact<{
  input: CreateSubmissionInput;
}>;


export type SubmitToBountyMutation = { __typename?: 'Mutation', submitToBounty: { __typename?: 'BountySubmissionType', id: string, bountyId: string, submittedBy: string, githubPullRequestUrl?: string | null, status: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedBy?: string | null, reviewComments?: string | null, paidAt?: string | null, rewardTransactionHash?: string | null, submittedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null, reviewedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null } };

export type ReviewSubmissionMutationVariables = Exact<{
  input: ReviewSubmissionInput;
}>;


export type ReviewSubmissionMutation = { __typename?: 'Mutation', reviewSubmission: { __typename?: 'BountySubmissionType', id: string, bountyId: string, submittedBy: string, githubPullRequestUrl?: string | null, status: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedBy?: string | null, reviewComments?: string | null, paidAt?: string | null, rewardTransactionHash?: string | null, submittedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null, reviewedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null } };

export type MarkSubmissionPaidMutationVariables = Exact<{
  submissionId: Scalars['ID']['input'];
  transactionHash: Scalars['String']['input'];
}>;


export type MarkSubmissionPaidMutation = { __typename?: 'Mutation', markSubmissionPaid: { __typename?: 'BountySubmissionType', id: string, bountyId: string, submittedBy: string, githubPullRequestUrl?: string | null, status: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedBy?: string | null, reviewComments?: string | null, paidAt?: string | null, rewardTransactionHash?: string | null, submittedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null, reviewedByUser?: { __typename?: 'BountySubmissionUser', id: string, name?: string | null, image?: string | null } | null } };


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
  createdBy
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

export const useCreateBountyMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateBountyMutation, TError, CreateBountyMutationVariables, TContext>) => {
    
    return useMutation<CreateBountyMutation, TError, CreateBountyMutationVariables, TContext>(
      {
    mutationKey: ['CreateBounty'],
    mutationFn: (variables?: CreateBountyMutationVariables) => fetcher<CreateBountyMutation, CreateBountyMutationVariables>(CreateBountyDocument, variables)(),
    ...options
  }
    )};

export const UpdateBountyDocument = `
    mutation UpdateBounty($input: UpdateBountyInput!) {
  updateBounty(input: $input) {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useUpdateBountyMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateBountyMutation, TError, UpdateBountyMutationVariables, TContext>) => {
    
    return useMutation<UpdateBountyMutation, TError, UpdateBountyMutationVariables, TContext>(
      {
    mutationKey: ['UpdateBounty'],
    mutationFn: (variables?: UpdateBountyMutationVariables) => fetcher<UpdateBountyMutation, UpdateBountyMutationVariables>(UpdateBountyDocument, variables)(),
    ...options
  }
    )};

export const DeleteBountyDocument = `
    mutation DeleteBounty($id: ID!) {
  deleteBounty(id: $id)
}
    `;

export const useDeleteBountyMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteBountyMutation, TError, DeleteBountyMutationVariables, TContext>) => {
    
    return useMutation<DeleteBountyMutation, TError, DeleteBountyMutationVariables, TContext>(
      {
    mutationKey: ['DeleteBounty'],
    mutationFn: (variables?: DeleteBountyMutationVariables) => fetcher<DeleteBountyMutation, DeleteBountyMutationVariables>(DeleteBountyDocument, variables)(),
    ...options
  }
    )};

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

export const useBountiesQuery = <
      TData = BountiesQuery,
      TError = unknown
    >(
      variables?: BountiesQueryVariables,
      options?: Omit<UseQueryOptions<BountiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<BountiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<BountiesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['Bounties'] : ['Bounties', variables],
    queryFn: fetcher<BountiesQuery, BountiesQueryVariables>(BountiesDocument, variables),
    ...options
  }
    )};

useBountiesQuery.getKey = (variables?: BountiesQueryVariables) => variables === undefined ? ['Bounties'] : ['Bounties', variables];

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

export const useBountyQuery = <
      TData = BountyQuery,
      TError = unknown
    >(
      variables: BountyQueryVariables,
      options?: Omit<UseQueryOptions<BountyQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<BountyQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<BountyQuery, TError, TData>(
      {
    queryKey: ['Bounty', variables],
    queryFn: fetcher<BountyQuery, BountyQueryVariables>(BountyDocument, variables),
    ...options
  }
    )};

useBountyQuery.getKey = (variables: BountyQueryVariables) => ['Bounty', variables];

export const ActiveBountiesDocument = `
    query ActiveBounties {
  activeBounties {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useActiveBountiesQuery = <
      TData = ActiveBountiesQuery,
      TError = unknown
    >(
      variables?: ActiveBountiesQueryVariables,
      options?: Omit<UseQueryOptions<ActiveBountiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ActiveBountiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ActiveBountiesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['ActiveBounties'] : ['ActiveBounties', variables],
    queryFn: fetcher<ActiveBountiesQuery, ActiveBountiesQueryVariables>(ActiveBountiesDocument, variables),
    ...options
  }
    )};

useActiveBountiesQuery.getKey = (variables?: ActiveBountiesQueryVariables) => variables === undefined ? ['ActiveBounties'] : ['ActiveBounties', variables];

export const OrganizationBountiesDocument = `
    query OrganizationBounties($organizationId: ID!) {
  organizationBounties(organizationId: $organizationId) {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useOrganizationBountiesQuery = <
      TData = OrganizationBountiesQuery,
      TError = unknown
    >(
      variables: OrganizationBountiesQueryVariables,
      options?: Omit<UseQueryOptions<OrganizationBountiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<OrganizationBountiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<OrganizationBountiesQuery, TError, TData>(
      {
    queryKey: ['OrganizationBounties', variables],
    queryFn: fetcher<OrganizationBountiesQuery, OrganizationBountiesQueryVariables>(OrganizationBountiesDocument, variables),
    ...options
  }
    )};

useOrganizationBountiesQuery.getKey = (variables: OrganizationBountiesQueryVariables) => ['OrganizationBounties', variables];

export const ProjectBountiesDocument = `
    query ProjectBounties($projectId: ID!) {
  projectBounties(projectId: $projectId) {
    ...BountyFields
  }
}
    ${BountyFieldsFragmentDoc}`;

export const useProjectBountiesQuery = <
      TData = ProjectBountiesQuery,
      TError = unknown
    >(
      variables: ProjectBountiesQueryVariables,
      options?: Omit<UseQueryOptions<ProjectBountiesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ProjectBountiesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ProjectBountiesQuery, TError, TData>(
      {
    queryKey: ['ProjectBounties', variables],
    queryFn: fetcher<ProjectBountiesQuery, ProjectBountiesQueryVariables>(ProjectBountiesDocument, variables),
    ...options
  }
    )};

useProjectBountiesQuery.getKey = (variables: ProjectBountiesQueryVariables) => ['ProjectBounties', variables];

export const LeaderboardDocument = `
    query Leaderboard($filters: LeaderboardFilters!, $pagination: LeaderboardPagination!) {
  leaderboard(filters: $filters, pagination: $pagination) {
    entries {
      rank
      previousRank
      rankChange
      contributor {
        id
        userId
        walletAddress
        displayName
        avatarUrl
        totalScore
        tier
        stats {
          totalCompleted
          totalEarnings
          earningsCurrency
          completionRate
          averageCompletionTime
          currentStreak
          longestStreak
          nextTierThreshold
          currentTierPoints
        }
        topTags
        lastActiveAt
      }
    }
    totalCount
    currentUserRank
    lastUpdatedAt
  }
}
    `;

export const useLeaderboardQuery = <
      TData = LeaderboardQuery,
      TError = unknown
    >(
      variables: LeaderboardQueryVariables,
      options?: Omit<UseQueryOptions<LeaderboardQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<LeaderboardQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<LeaderboardQuery, TError, TData>(
      {
    queryKey: ['Leaderboard', variables],
    queryFn: fetcher<LeaderboardQuery, LeaderboardQueryVariables>(LeaderboardDocument, variables),
    ...options
  }
    )};

useLeaderboardQuery.getKey = (variables: LeaderboardQueryVariables) => ['Leaderboard', variables];

export const UserLeaderboardRankDocument = `
    query UserLeaderboardRank($userId: ID!) {
  userLeaderboardRank(userId: $userId) {
    rank
    contributor {
      id
      userId
      walletAddress
      displayName
      avatarUrl
      totalScore
      tier
      stats {
        totalCompleted
        totalEarnings
        earningsCurrency
        completionRate
        averageCompletionTime
        currentStreak
        longestStreak
        nextTierThreshold
        currentTierPoints
      }
      topTags
      lastActiveAt
    }
  }
}
    `;

export const useUserLeaderboardRankQuery = <
      TData = UserLeaderboardRankQuery,
      TError = unknown
    >(
      variables: UserLeaderboardRankQueryVariables,
      options?: Omit<UseQueryOptions<UserLeaderboardRankQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<UserLeaderboardRankQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<UserLeaderboardRankQuery, TError, TData>(
      {
    queryKey: ['UserLeaderboardRank', variables],
    queryFn: fetcher<UserLeaderboardRankQuery, UserLeaderboardRankQueryVariables>(UserLeaderboardRankDocument, variables),
    ...options
  }
    )};

useUserLeaderboardRankQuery.getKey = (variables: UserLeaderboardRankQueryVariables) => ['UserLeaderboardRank', variables];

export const TopContributorsDocument = `
    query TopContributors($count: Int = 5) {
  topContributors(count: $count) {
    id
    userId
    walletAddress
    displayName
    avatarUrl
    totalScore
    tier
    stats {
      totalCompleted
      totalEarnings
      earningsCurrency
      completionRate
      averageCompletionTime
      currentStreak
      longestStreak
      nextTierThreshold
      currentTierPoints
    }
    topTags
    lastActiveAt
  }
}
    `;

export const useTopContributorsQuery = <
      TData = TopContributorsQuery,
      TError = unknown
    >(
      variables?: TopContributorsQueryVariables,
      options?: Omit<UseQueryOptions<TopContributorsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<TopContributorsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<TopContributorsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['TopContributors'] : ['TopContributors', variables],
    queryFn: fetcher<TopContributorsQuery, TopContributorsQueryVariables>(TopContributorsDocument, variables),
    ...options
  }
    )};

useTopContributorsQuery.getKey = (variables?: TopContributorsQueryVariables) => variables === undefined ? ['TopContributors'] : ['TopContributors', variables];

export const SubmitToBountyDocument = `
    mutation SubmitToBounty($input: CreateSubmissionInput!) {
  submitToBounty(input: $input) {
    ...SubmissionFields
  }
}
    ${SubmissionFieldsFragmentDoc}`;

export const useSubmitToBountyMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SubmitToBountyMutation, TError, SubmitToBountyMutationVariables, TContext>) => {
    
    return useMutation<SubmitToBountyMutation, TError, SubmitToBountyMutationVariables, TContext>(
      {
    mutationKey: ['SubmitToBounty'],
    mutationFn: (variables?: SubmitToBountyMutationVariables) => fetcher<SubmitToBountyMutation, SubmitToBountyMutationVariables>(SubmitToBountyDocument, variables)(),
    ...options
  }
    )};

export const ReviewSubmissionDocument = `
    mutation ReviewSubmission($input: ReviewSubmissionInput!) {
  reviewSubmission(input: $input) {
    ...SubmissionFields
  }
}
    ${SubmissionFieldsFragmentDoc}`;

export const useReviewSubmissionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ReviewSubmissionMutation, TError, ReviewSubmissionMutationVariables, TContext>) => {
    
    return useMutation<ReviewSubmissionMutation, TError, ReviewSubmissionMutationVariables, TContext>(
      {
    mutationKey: ['ReviewSubmission'],
    mutationFn: (variables?: ReviewSubmissionMutationVariables) => fetcher<ReviewSubmissionMutation, ReviewSubmissionMutationVariables>(ReviewSubmissionDocument, variables)(),
    ...options
  }
    )};

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
      TContext = unknown
    >(options?: UseMutationOptions<MarkSubmissionPaidMutation, TError, MarkSubmissionPaidMutationVariables, TContext>) => {
    
    return useMutation<MarkSubmissionPaidMutation, TError, MarkSubmissionPaidMutationVariables, TContext>(
      {
    mutationKey: ['MarkSubmissionPaid'],
    mutationFn: (variables?: MarkSubmissionPaidMutationVariables) => fetcher<MarkSubmissionPaidMutation, MarkSubmissionPaidMutationVariables>(MarkSubmissionPaidDocument, variables)(),
    ...options
  }
    )};
