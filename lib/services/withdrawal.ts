import { WithdrawalRequest, WithdrawalValidationResult } from "@/types/withdrawal";
import { ComplianceService } from "./compliance";
import { TermsService } from "./terms";
import { GeoRestrictionService } from "./geo-restriction";
import { mockWalletWithAssets } from "@/lib/mock-wallet";

const MOCK_WITHDRAWALS: Record<string, WithdrawalRequest[]> = {};

export class WithdrawalService {
    static async validate(userId: string, amount: number, ip: string): Promise<WithdrawalValidationResult> {
        const result: WithdrawalValidationResult = {
            valid: true,
            errors: [],
            warnings: [],
            blockers: {},
        };

        // Check balance
        if (amount > mockWalletWithAssets.balance) {
            result.valid = false;
            result.errors.push('Insufficient balance');
            result.blockers.insufficientBalance = true;
        }

        // Check limits
        const compliance = await ComplianceService.getUserCompliance(userId);
        const limitCheck = await ComplianceService.validateWithdrawalAmount(userId, amount);

        if (!limitCheck.valid) {
            result.valid = false;
            result.errors.push(`Exceeds ${limitCheck.exceededLimit} limit`);
            result.blockers.exceedsLimit = true;
            result.blockers.limitType = limitCheck.exceededLimit;
        }

        // Check hold state
        if (compliance.holdState !== 'NONE') {
            result.valid = false;
            result.errors.push(`Account is ${compliance.holdState.toLowerCase()}`);
            result.blockers.complianceHold = true;
        }

        // Check terms
        const termsStatus = await TermsService.getUserTermsStatus(userId);
        if (termsStatus.requiresAcceptance) {
            result.valid = false;
            result.errors.push('Terms must be accepted');
            result.blockers.termsNotAccepted = true;
        }

        // Check location
        const location = await GeoRestrictionService.checkLocation(ip);
        if (location.isRestricted) {
            result.valid = false;
            result.errors.push('Withdrawals not available in your region');
            result.blockers.restrictedJurisdiction = true;
        }

        return result;
    }

    static async submit(userId: string, amount: number, currency: string, destinationId: string, ip: string): Promise<WithdrawalRequest> {
        const validation = await this.validate(userId, amount, ip);
        if (!validation.valid) {
            throw new Error(validation.errors[0] || 'Withdrawal validation failed');
        }

        const compliance = await ComplianceService.getUserCompliance(userId);

        const withdrawal: WithdrawalRequest = {
            id: `wd-${Date.now()}`,
            userId,
            amount,
            currency,
            destinationId,
            fee: 2.50,
            netAmount: amount - 2.50,
            status: 'PENDING',
            compliance: {
                tierAtSubmission: compliance.currentTier,
                limitsChecked: true,
                termsAccepted: true,
                geoCheckPassed: true,
            },
            createdAt: new Date().toISOString(),
        };

        if (!MOCK_WITHDRAWALS[userId]) {
            MOCK_WITHDRAWALS[userId] = [];
        }
        MOCK_WITHDRAWALS[userId].push(withdrawal);

        await ComplianceService.trackWithdrawal(userId, amount);

        return withdrawal;
    }

    static async getHistory(userId: string): Promise<WithdrawalRequest[]> {
        return MOCK_WITHDRAWALS[userId] || [];
    }
}
