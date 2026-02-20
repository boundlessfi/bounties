import { VerificationAppeal } from "@/types/compliance";
import { EmailService } from "./email";

const MOCK_APPEALS: Record<string, VerificationAppeal> = {};

export class AppealService {
    static async submitAppeal(
        userId: string,
        verificationRequestId: string,
        reason: string,
        additionalInfo?: string
    ): Promise<VerificationAppeal> {
        const appealId = `appeal-${userId}-${Date.now()}`;
        const appeal: VerificationAppeal = {
            id: appealId,
            userId,
            verificationRequestId,
            reason,
            additionalInfo,
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
        };

        MOCK_APPEALS[appealId] = appeal;

        const userEmail = `user-${userId}@example.com`;
        await EmailService.sendAppealConfirmation(userEmail, appealId);

        return { ...appeal };
    }

    static async getAppeal(verificationRequestId: string): Promise<VerificationAppeal | null> {
        const appeal = Object.values(MOCK_APPEALS)
            .find(a => a.verificationRequestId === verificationRequestId);

        return appeal ? { ...appeal } : null;
    }

    static async getUserAppeals(userId: string): Promise<VerificationAppeal[]> {
        return Object.values(MOCK_APPEALS)
            .filter(a => a.userId === userId)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
}
