import {
    TermsVersion,
    TermsAcceptance,
    UserTermsStatus,
} from "@/types/terms";

// Mock Data Stores
const MOCK_TERMS_VERSIONS: TermsVersion[] = [
    {
        id: 'terms-v1',
        version: '1.0.0',
        title: 'Withdrawal Terms and Conditions',
        summary: 'Standard terms for fiat withdrawal services',
        content: `# Withdrawal Terms and Conditions

## 1. General Terms

By using Boundless Bounties withdrawal services, you agree to comply with these terms and all applicable laws and regulations.

## 2. Withdrawal Limits

Withdrawal limits are determined by your KYC verification tier:
- Unverified: $100 daily, $500 monthly
- Basic: $1,000 daily, $15,000 monthly
- Verified: $5,000 daily, $75,000 monthly
- Enhanced: $25,000 daily, $300,000 monthly

## 3. Processing Times

- Withdrawals are processed within 1-5 business days
- Additional verification may be required for large transactions
- Weekends and holidays may extend processing times

## 4. Fees

- Standard withdrawal fee: $2.50 per transaction
- Additional fees may apply for expedited processing
- Currency conversion fees apply for non-USD withdrawals

## 5. Compliance Requirements

- You must maintain accurate personal information
- Additional verification may be requested at any time
- We reserve the right to freeze or cancel transactions for compliance reasons

## 6. Geographic Restrictions

- Services may not be available in all jurisdictions
- You must not use VPN or proxy services to bypass restrictions
- We comply with all local financial regulations

## 7. Account Security

- You are responsible for maintaining account security
- Report any unauthorized access immediately
- Two-factor authentication is strongly recommended

## 8. Dispute Resolution

- Disputes must be reported within 30 days
- We will investigate all disputes thoroughly
- Resolution may take 15-30 business days

## 9. Changes to Terms

- We reserve the right to update these terms
- You will be notified of material changes
- Continued use constitutes acceptance of new terms

## 10. Contact

For questions or concerns, contact support@boundless.fi`,
        effectiveDate: '2024-01-01T00:00:00Z',
        requiresReacceptance: false,
        createdAt: '2024-01-01T00:00:00Z',
    },
];

const MOCK_TERMS_ACCEPTANCES: Record<string, TermsAcceptance[]> = {};

export class TermsService {
    /**
     * Get current active terms version
     */
    static async getCurrentTermsVersion(): Promise<TermsVersion> {
        await this.simulateDelay();

        // Return the latest version
        const sorted = [...MOCK_TERMS_VERSIONS].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return { ...sorted[0] };
    }

    /**
     * Get user's terms acceptance status
     */
    static async getUserTermsStatus(userId: string): Promise<UserTermsStatus> {
        await this.simulateDelay();

        const currentTerms = await this.getCurrentTermsVersion();
        const userAcceptances = MOCK_TERMS_ACCEPTANCES[userId] || [];

        // Find latest acceptance
        const sortedAcceptances = [...userAcceptances].sort((a, b) =>
            new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime()
        );

        const lastAcceptance = sortedAcceptances[0];

        // Check if current version is accepted
        const hasAcceptedCurrent = userAcceptances.some(
            acceptance => acceptance.termsVersionId === currentTerms.id
        );

        // Determine if reacceptance is required
        const requiresAcceptance = !hasAcceptedCurrent ||
            (currentTerms.requiresReacceptance && !hasAcceptedCurrent);

        return {
            hasAcceptedCurrent,
            currentVersion: currentTerms.version,
            lastAcceptedVersion: lastAcceptance?.termsVersion,
            lastAcceptedAt: lastAcceptance?.acceptedAt,
            requiresAcceptance,
        };
    }

    /**
     * Record terms acceptance
     */
    static async acceptTerms(
        userId: string,
        termsVersionId: string,
        metadata: {
            ipAddress: string;
            userAgent: string;
        }
    ): Promise<TermsAcceptance> {
        await this.simulateDelay();

        // Verify terms version exists
        const termsVersion = MOCK_TERMS_VERSIONS.find(v => v.id === termsVersionId);
        if (!termsVersion) {
            throw new Error('Terms version not found');
        }

        // Check if already accepted
        const existingAcceptances = MOCK_TERMS_ACCEPTANCES[userId] || [];
        const alreadyAccepted = existingAcceptances.some(
            a => a.termsVersionId === termsVersionId
        );

        if (alreadyAccepted) {
            // Return existing acceptance
            return existingAcceptances.find(a => a.termsVersionId === termsVersionId)!;
        }

        // Create new acceptance record
        const acceptance: TermsAcceptance = {
            id: `acceptance-${userId}-${termsVersionId}-${Date.now()}`,
            userId,
            termsVersionId,
            termsVersion: termsVersion.version,
            acceptedAt: new Date().toISOString(),
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        };

        // Store acceptance
        if (!MOCK_TERMS_ACCEPTANCES[userId]) {
            MOCK_TERMS_ACCEPTANCES[userId] = [];
        }
        MOCK_TERMS_ACCEPTANCES[userId].push(acceptance);

        return { ...acceptance };
    }

    /**
     * Check if user needs to accept updated terms
     */
    static async requiresReacceptance(userId: string): Promise<boolean> {
        const status = await this.getUserTermsStatus(userId);
        return status.requiresAcceptance;
    }

    /**
     * Get terms acceptance history for user
     */
    static async getAcceptanceHistory(userId: string): Promise<TermsAcceptance[]> {
        await this.simulateDelay();

        const acceptances = MOCK_TERMS_ACCEPTANCES[userId] || [];

        // Sort by acceptance date (newest first)
        return [...acceptances].sort((a, b) =>
            new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime()
        );
    }

    /**
     * Get terms version by ID
     */
    static async getTermsVersion(versionId: string): Promise<TermsVersion | null> {
        await this.simulateDelay();

        const version = MOCK_TERMS_VERSIONS.find(v => v.id === versionId);
        return version ? { ...version } : null;
    }

    /**
     * Get all terms versions
     */
    static async getAllTermsVersions(): Promise<TermsVersion[]> {
        await this.simulateDelay();

        return [...MOCK_TERMS_VERSIONS].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    /**
     * Create new terms version (admin function)
     */
    static async createTermsVersion(
        version: Omit<TermsVersion, 'id' | 'createdAt'>
    ): Promise<TermsVersion> {
        await this.simulateDelay();

        const newVersion: TermsVersion = {
            ...version,
            id: `terms-v${MOCK_TERMS_VERSIONS.length + 1}`,
            createdAt: new Date().toISOString(),
        };

        MOCK_TERMS_VERSIONS.push(newVersion);
        return { ...newVersion };
    }

    /**
     * Simulate database delay
     */
    private static async simulateDelay(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Clear all data (for testing)
     */
    static clearAllData(): void {
        Object.keys(MOCK_TERMS_ACCEPTANCES).forEach(key => delete MOCK_TERMS_ACCEPTANCES[key]);
        MOCK_TERMS_VERSIONS.length = 1; // Keep only the first version
    }
}
