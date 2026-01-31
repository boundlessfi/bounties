// KYC Verification Tiers
export type KYCTier = 'UNVERIFIED' | 'BASIC' | 'VERIFIED' | 'ENHANCED';

// Compliance Hold States
export type ComplianceHoldState = 'NONE' | 'REVIEW' | 'SUSPENDED' | 'BLOCKED';

// Verification Status
export type VerificationStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

// Verification Document Types
export type DocumentType = 'GOVERNMENT_ID' | 'PROOF_OF_ADDRESS' | 'SELFIE' | 'ADDITIONAL';

export interface WithdrawalLimits {
  daily: number;
  weekly: number;
  monthly: number;
  perTransaction: number;
}

export interface WithdrawalUsage {
  dailyUsed: number;
  weeklyUsed: number;
  monthlyUsed: number;
  lifetimeTotal: number;
  lastResetDaily: string;
  lastResetWeekly: string;
  lastResetMonthly: string;
}

export interface KYCTierConfig {
  tier: KYCTier;
  limits: WithdrawalLimits;
  requirements: string[];
  processingTime?: string;
  description: string;
}

export interface UserCompliance {
  userId: string;
  currentTier: KYCTier;
  limits: WithdrawalLimits;
  usage: WithdrawalUsage;
  holdState: ComplianceHoldState;
  holdReason?: string;
  verificationStatus: VerificationStatus;
  restrictedJurisdiction: boolean;
  jurisdictionCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  targetTier: KYCTier;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents: VerificationDocument[];
  notes?: string;
}

export interface VerificationDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
}

// Helper type for remaining limits calculation
export interface RemainingLimits {
  daily: number;
  weekly: number;
  monthly: number;
  percentUsed: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// Appeal types
export type AppealStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED';

export interface VerificationAppeal {
  id: string;
  userId: string;
  verificationRequestId: string;
  reason: string;
  additionalInfo?: string;
  status: AppealStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}
