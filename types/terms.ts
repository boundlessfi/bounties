export interface TermsVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  summary?: string;
  effectiveDate: string;
  requiresReacceptance: boolean;
  createdAt: string;
}

export interface TermsAcceptance {
  id: string;
  userId: string;
  termsVersionId: string;
  termsVersion: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface UserTermsStatus {
  hasAcceptedCurrent: boolean;
  currentVersion: string;
  lastAcceptedVersion?: string;
  lastAcceptedAt?: string;
  requiresAcceptance: boolean;
}
