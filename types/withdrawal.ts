import { KYCTier } from './compliance';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  destinationId: string; // Bank account ID
  destinationName?: string;
  fee: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  compliance: {
    tierAtSubmission: KYCTier;
    limitsChecked: boolean;
    termsAccepted: boolean;
    geoCheckPassed: boolean;
  };
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
}

export interface WithdrawalValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  blockers: {
    insufficientBalance?: boolean;
    exceedsLimit?: boolean;
    limitType?: 'daily' | 'weekly' | 'monthly' | 'perTransaction';
    complianceHold?: boolean;
    restrictedJurisdiction?: boolean;
    termsNotAccepted?: boolean;
    unverifiedAccount?: boolean;
  };
}

export interface WithdrawalHistoryFilters {
  startDate?: string;
  endDate?: string;
  status?: WithdrawalRequest['status'];
  limit?: number;
  offset?: number;
}
