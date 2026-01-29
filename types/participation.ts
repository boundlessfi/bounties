export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Application {
    id: string
    bountyId: string
    applicantId: string
    applicantName?: string // Optional for UI convenience
    coverLetter: string
    portfolioUrl?: string
    status: ApplicationStatus
    submittedAt: string
    reviewedAt?: string
    feedback?: string
}

export type SubmissionStatus = 'pending' | 'accepted' | 'rejected'

export interface Submission {
    id: string
    bountyId: string
    contributorId: string
    contributorName?: string
    content: string // URL or text description
    status: SubmissionStatus
    submittedAt: string
    reviewedAt?: string
    feedback?: string
}

export type MilestoneStatus = 'active' | 'completed' | 'advanced'

export interface MilestoneParticipation {
    id: string
    bountyId: string
    contributorId: string
    contributorName?: string
    currentMilestone: number // 1-based index
    status: MilestoneStatus
    joinedAt: string
    lastUpdatedAt: string
}
