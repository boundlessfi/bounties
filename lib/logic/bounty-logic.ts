import { differenceInDays, isPast, parseISO } from 'date-fns';
import { ClaimingModel } from '@/types/bounty'; // Keep if needed for value checking, or remove if just string

export class BountyLogic {
    /**
     * Configuration for inactivity thresholds (in days)
     */
    static readonly INACTIVITY_THRESHOLD_DAYS = 7;
    static readonly CLAIM_DURATION_DAYS = 14;

    /**
     * Processes the bounty status based on its model and timestamps.
     * - Checks for inactivity auto-release for single-claim.
     * - Checks for expired claims.
     * - Returns the potentially modified bounty (this simulates the backend update).
     */
    static processBountyStatus<T extends {
        status: string;
        claimingModel: ClaimingModel;
        claimExpiresAt?: string;
        lastActivityAt?: string;
        claimedBy?: string;
        claimedAt?: string;
    }>(bounty: T): T {
        if (bounty.status !== 'claimed' && bounty.status !== 'open') return bounty;

        const now = new Date();
        // Shallow copy works for pure property updates
        const newBounty = { ...bounty };

        // Anti-squatting: Check inactivity for single-claim
        if (
            bounty.claimingModel === 'single-claim' &&
            bounty.status === 'claimed'
        ) {
            // Helper to get Date object
            const getDate = (val?: string) => {
                if (!val) return null;
                return parseISO(val);
            };

            const expiresAt = getDate(bounty.claimExpiresAt);

            // If claim expired
            if (expiresAt && isPast(expiresAt)) {
                // Auto-release
                newBounty.status = 'open';
                newBounty.claimedBy = undefined;
                newBounty.claimedAt = undefined;
                newBounty.claimExpiresAt = undefined;
            }

            // If inactive for too long
            const lastActive = getDate(bounty.lastActivityAt);
            if (lastActive) {
                const daysInactive = differenceInDays(now, lastActive);
                if (daysInactive > this.INACTIVITY_THRESHOLD_DAYS) {
                    // Auto-release due to inactivity
                    newBounty.status = 'open';
                    newBounty.claimedBy = undefined;
                    newBounty.claimedAt = undefined;
                    newBounty.claimExpiresAt = undefined;
                }
            }
        }

        return newBounty;
    }

    /**
     * Returns metadata about the claim status suitable for UI display.
     */
    static getClaimStatusDisplay(bounty: {
        status: string;
        claimingModel: ClaimingModel;
        claimExpiresAt?: string;
    }) {
        if (bounty.status === 'open') return { label: 'Available', color: 'green' };

        if (bounty.status === 'claimed') {
            if (bounty.claimingModel === 'single-claim') {
                return {
                    label: 'Claimed',
                    color: 'orange',
                    details: bounty.claimExpiresAt ? `Expires ${BountyLogic.formatDate(bounty.claimExpiresAt)}` : 'In Progress'
                };
            }
            if (bounty.claimingModel === 'application') {
                return { label: 'Applications Open', color: 'blue' };
            }
        }

        return { label: bounty.status, color: 'gray' };
    }

    private static formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString();
    }
}
