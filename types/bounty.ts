export type BountyType =
  | 'feature'
  | 'bug'
  | 'documentation'
  | 'refactor'
  | 'other'

export type ClaimingModel = 'single-claim' | 'application' | 'competition' | 'multi-winner' | 'milestone'

export interface Bounty {
  id: string
  type: BountyType

  projectId: string
  projectName: string
  projectLogoUrl: string | null

  issueTitle: string
  issueNumber: number
  githubRepo: string
  githubIssueUrl: string

  description: string
  rewardAmount: number | null
  rewardCurrency: 'USD' | 'USDC' | 'XLM' | string

  claimingModel: ClaimingModel

  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  tags: string[]

  status: 'open' | 'claimed' | 'closed'

  createdAt: string
  updatedAt: string

  // Status & Logic fields
  claimedAt?: string
  claimedBy?: string // user/wallet ID
  lastActivityAt?: string // for anti-squatting
  claimExpiresAt?: string
  submissionsEndDate?: string // For competitions/applications
  requirements?: string[]
  scope?: string
  milestones?: unknown[] // Optional milestone definition

  // Participation Lists (User IDs)
  applicants?: string[]
  competitors?: string[]
  members?: string[] // For milestone/collaborative bounties
}

export type BountyStatus = Bounty['status']
export type DifficultyLevel = NonNullable<Bounty['difficulty']>
