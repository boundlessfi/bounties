export type BountyType =
  | 'feature'
  | 'bug'
  | 'documentation'
  | 'refactor'
  | 'other'

export interface Bounty {
  id: string
  type: BountyType

  projectId: string
  projectName: string
  projectLogoUrl: string | null

  issueTitle: string
  issueNumber: number
  githubRepo: string // owner/repo
  githubIssueUrl: string

  description: string
  rewardAmount: number | null
  rewardCurrency: 'USD' | 'USDC' | 'XLM' | string

  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  tags: string[]

  status: 'open' | 'claimed' | 'closed'

  createdAt: string
  updatedAt: string
  
  // Optional: Keep requirements/scope if needed for details view, 
  // but strictly adhering to User's type for now. 
  // I will add them as optional to avoid breaking existing UI logic too much if I can helper it, 
  // or I will just map them in components if they are not in the type.
  // The user said "Expected Data Types", implying this is the shape.
  // I will add requirements and scope as optional extra fields if they were used in the UI, 
  // or I will assume the description contains them or they are not part of this specific list view type.
  // Existing code uses `requirements` and `scope`. I should probably keep them as optional to avoid losing data in the details view if possible,
  // or I'll have to remove that UI section. 
  // Let's add them as optional to be safe and backward compatible with existing components.
  requirements?: string[]
  scope?: string
}

export type BountyStatus = Bounty['status']
export type DifficultyLevel = NonNullable<Bounty['difficulty']>
