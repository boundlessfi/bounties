import { z } from 'zod';
import { get } from './client';

// Schema
export const platformStatsSchema = z.object({
    totalFundsDistributed: z.number(),
    totalContributorsPaid: z.number(),
    totalProjectsFunded: z.number(),
    averagePayoutTimeDays: z.number(),
});

export const recentPayoutSchema = z.object({
    id: z.string(),
    contributorName: z.string(),
    contributorAvatar: z.string().nullable(),
    amount: z.number(),
    currency: z.string(),
    projectName: z.string(),
    paidAt: z.string(),
});

export type PlatformStats = z.infer<typeof platformStatsSchema>;
export type RecentPayout = z.infer<typeof recentPayoutSchema>;

const TRANSPARENCY_ENDPOINT = '/api/transparency';

export const transparencyApi = {
    getStats: (): Promise<PlatformStats> =>
        get<PlatformStats>(`${TRANSPARENCY_ENDPOINT}/stats`),

    getRecentPayouts: (limit = 10): Promise<RecentPayout[]> =>
        get<RecentPayout[]>(`${TRANSPARENCY_ENDPOINT}/payouts`, { params: { limit } }),
};