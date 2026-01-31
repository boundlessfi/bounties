import {
    VerificationRequest,
    VerificationDocument,
    KYCTier,
    VerificationStatus,
    DocumentType,
} from "@/types/compliance";
import { ComplianceService } from "./compliance";
import { EmailService } from "./email";

// Mock Data Store
const MOCK_VERIFICATION_REQUESTS: Record<string, VerificationRequest> = {};
const MOCK_DOCUMENTS: Record<string, VerificationDocument[]> = {};

export class VerificationService {
    /**
     * Create new verification request
     */
    static async createVerificationRequest(
        userId: string,
        targetTier: KYCTier
    ): Promise<VerificationRequest> {
        await this.simulateDelay();

        // Check if user already has a pending request
        const existing = Object.values(MOCK_VERIFICATION_REQUESTS).find(
            req => req.userId === userId && req.status === 'PENDING'
        );

        if (existing) {
            throw new Error('You already have a pending verification request');
        }

        // Get current compliance to validate tier upgrade
        const compliance = await ComplianceService.getUserCompliance(userId);
        const tiers: KYCTier[] = ['UNVERIFIED', 'BASIC', 'VERIFIED', 'ENHANCED'];
        const currentIndex = tiers.indexOf(compliance.currentTier);
        const targetIndex = tiers.indexOf(targetTier);

        if (targetIndex <= currentIndex) {
            throw new Error('Target tier must be higher than current tier');
        }

        // Create verification request
        const requestId = `vreq-${userId}-${Date.now()}`;
        const request: VerificationRequest = {
            id: requestId,
            userId,
            targetTier,
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
            documents: [],
        };

        MOCK_VERIFICATION_REQUESTS[requestId] = request;
        MOCK_DOCUMENTS[requestId] = [];

        // Update user's verification status
        await ComplianceService.updateVerificationStatus(userId, 'PENDING');

        return { ...request };
    }

    /**
     * Get user's current verification status
     */
    static async getVerificationStatus(userId: string): Promise<VerificationRequest | null> {
        await this.simulateDelay();

        // Find most recent verification request for user
        const requests = Object.values(MOCK_VERIFICATION_REQUESTS)
            .filter(req => req.userId === userId)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        if (requests.length === 0) {
            return null;
        }

        const request = requests[0];

        // Attach documents
        const documents = MOCK_DOCUMENTS[request.id] || [];
        return {
            ...request,
            documents: [...documents],
        };
    }

    /**
     * Upload verification document
     */
    static async uploadDocument(
        requestId: string,
        document: {
            type: DocumentType;
            fileName: string;
            file: File | Blob;
        }
    ): Promise<VerificationDocument> {
        await this.simulateDelay();

        const request = MOCK_VERIFICATION_REQUESTS[requestId];
        if (!request) {
            throw new Error('Verification request not found');
        }

        if (request.status !== 'PENDING') {
            throw new Error('Cannot upload documents to non-pending request');
        }

        // Simulate file upload (in real implementation, upload to S3/cloud storage)
        const fileUrl = `https://storage.boundless.fi/documents/${requestId}/${document.fileName}`;

        // Create document record
        const doc: VerificationDocument = {
            id: `doc-${requestId}-${Date.now()}`,
            type: document.type,
            fileName: document.fileName,
            fileUrl,
            uploadedAt: new Date().toISOString(),
            verified: false,
        };

        // Store document
        if (!MOCK_DOCUMENTS[requestId]) {
            MOCK_DOCUMENTS[requestId] = [];
        }
        MOCK_DOCUMENTS[requestId].push(doc);

        // Update request's documents array
        request.documents = MOCK_DOCUMENTS[requestId];

        return { ...doc };
    }

    /**
     * Update verification request status (admin/automated function)
     */
    static async updateVerificationStatus(
        requestId: string,
        status: VerificationStatus,
        reason?: string
    ): Promise<boolean> {
        await this.simulateDelay();

        const request = MOCK_VERIFICATION_REQUESTS[requestId];
        if (!request) {
            throw new Error('Verification request not found');
        }

        // Update request status
        request.status = status;
        request.reviewedAt = new Date().toISOString();

        if (status === 'REJECTED' && reason) {
            request.rejectionReason = reason;
        }

        // If approved, upgrade user's tier
        if (status === 'APPROVED') {
            await ComplianceService.upgradeTier(request.userId, request.targetTier);
        }

        // Update user's verification status in compliance
        await ComplianceService.updateVerificationStatus(request.userId, status);

        // Send notification (in real implementation)
        await this.notifyStatusChange(request.userId, status);

        return true;
    }

    /**
     * Delete/remove a document
     */
    static async deleteDocument(requestId: string, documentId: string): Promise<boolean> {
        await this.simulateDelay();

        const request = MOCK_VERIFICATION_REQUESTS[requestId];
        if (!request || request.status !== 'PENDING') {
            throw new Error('Cannot delete documents from non-pending request');
        }

        const documents = MOCK_DOCUMENTS[requestId] || [];
        const index = documents.findIndex(doc => doc.id === documentId);

        if (index === -1) {
            throw new Error('Document not found');
        }

        // Remove document
        documents.splice(index, 1);
        request.documents = documents;

        return true;
    }

    /**
     * Get required document types for a tier
     */
    static getRequiredDocuments(targetTier: KYCTier): DocumentType[] {
        switch (targetTier) {
            case 'BASIC':
                return ['GOVERNMENT_ID'];
            case 'VERIFIED':
                return ['GOVERNMENT_ID', 'PROOF_OF_ADDRESS'];
            case 'ENHANCED':
                return ['GOVERNMENT_ID', 'PROOF_OF_ADDRESS', 'SELFIE'];
            default:
                return [];
        }
    }

    /**
     * Check if verification request has all required documents
     */
    static hasRequiredDocuments(request: VerificationRequest): boolean {
        const required = this.getRequiredDocuments(request.targetTier);
        const uploaded = request.documents.map(doc => doc.type);

        return required.every(type => uploaded.includes(type));
    }

    /**
     * Send status change notification
     */
    static async notifyStatusChange(
        userId: string,
        newStatus: VerificationStatus
    ): Promise<void> {
        const userEmail = `user-${userId}@example.com`;
        const request = Object.values(MOCK_VERIFICATION_REQUESTS)
            .find(req => req.userId === userId && req.status === newStatus);

        await EmailService.sendVerificationStatusEmail(
            userEmail,
            newStatus,
            request?.targetTier,
            request?.rejectionReason
        );
    }

    /**
     * Get all verification requests for user (history)
     */
    static async getVerificationHistory(userId: string): Promise<VerificationRequest[]> {
        await this.simulateDelay();

        const requests = Object.values(MOCK_VERIFICATION_REQUESTS)
            .filter(req => req.userId === userId)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        // Attach documents to each request
        return requests.map(req => ({
            ...req,
            documents: [...(MOCK_DOCUMENTS[req.id] || [])],
        }));
    }

    /**
     * Cancel pending verification request
     */
    static async cancelVerificationRequest(requestId: string, userId: string): Promise<boolean> {
        await this.simulateDelay();

        const request = MOCK_VERIFICATION_REQUESTS[requestId];
        if (!request) {
            throw new Error('Verification request not found');
        }

        if (request.userId !== userId) {
            throw new Error('Unauthorized');
        }

        if (request.status !== 'PENDING') {
            throw new Error('Can only cancel pending requests');
        }

        // Update status
        request.status = 'REJECTED';
        request.rejectionReason = 'Cancelled by user';
        request.reviewedAt = new Date().toISOString();

        // Update compliance status
        await ComplianceService.updateVerificationStatus(userId, 'NOT_STARTED');

        return true;
    }

    /**
     * Simulate database delay
     */
    private static async simulateDelay(ms: number = 100): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear all data (for testing)
     */
    static clearAllData(): void {
        Object.keys(MOCK_VERIFICATION_REQUESTS).forEach(key => delete MOCK_VERIFICATION_REQUESTS[key]);
        Object.keys(MOCK_DOCUMENTS).forEach(key => delete MOCK_DOCUMENTS[key]);
    }
}
