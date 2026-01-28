import { z } from 'zod';
import { get, post, put, del } from './client';
import type { PaginatedResponse, PaginationParams, SortParams } from './types';

// Bounty schemas
const bountyTypeSchema = z.enum(['feature', 'bug', 'documentation', 'refactor', 'other']);
const bountyStatusSchema = z.enum(['open', 'claimed', 'closed']);
const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
const claimingModelSchema = z.enum(['single-claim', 'application', 'competition', 'multi-winner']);

export const bountySchema = z.object({
    id: z.string(),
    type: bountyTypeSchema,
    projectId: z.string(),
    projectName: z.string(),
    projectLogoUrl: z.string().nullable(),
    issueTitle: z.string(),
    issueNumber: z.number(),
    githubRepo: z.string(),
    githubIssueUrl: z.string().url(),
    description: z.string(),
    rewardAmount: z.number().nullable(),
    rewardCurrency: z.string(),
    claimingModel: claimingModelSchema,
    difficulty: difficultySchema.nullable(),
    tags: z.array(z.string()),
    status: bountyStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    requirements: z.array(z.string()).optional(),
    scope: z.string().optional(),
});

export type Bounty = z.infer<typeof bountySchema>;
export type BountyType = z.infer<typeof bountyTypeSchema>;
export type BountyStatus = z.infer<typeof bountyStatusSchema>;
export type DifficultyLevel = z.infer<typeof difficultySchema>;
export type ClaimingModel = z.infer<typeof claimingModelSchema>;

// Query params
export interface BountyListParams extends PaginationParams, SortParams {
    status?: BountyStatus;
    type?: BountyType;
    difficulty?: DifficultyLevel;
    projectId?: string;
    tags?: string | string[];
    search?: string;
}

// Create bounty input
export const createBountySchema = bountySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
});

export type CreateBountyInput = z.infer<typeof createBountySchema>;

// Update bounty input
export const updateBountySchema = createBountySchema.partial();

export type UpdateBountyInput = z.infer<typeof updateBountySchema>;

// API endpoints
const BOUNTIES_ENDPOINT = '/api/bounties';

export const bountiesApi = {
    list: (params?: BountyListParams): Promise<PaginatedResponse<Bounty>> => {
        // Convert tags array to comma-separated string for query params
        const queryParams: Record<string, unknown> = { ...params };
        if (queryParams.tags && Array.isArray(queryParams.tags)) {
            queryParams.tags = queryParams.tags.join(',');
        }
        return get<PaginatedResponse<Bounty>>(BOUNTIES_ENDPOINT, { params: queryParams });
    },

    getById: (id: string): Promise<Bounty> =>
        get<Bounty>(`${BOUNTIES_ENDPOINT}/${id}`),

    create: (data: CreateBountyInput): Promise<Bounty> =>
        post<Bounty>(BOUNTIES_ENDPOINT, data),

    update: (id: string, data: UpdateBountyInput): Promise<Bounty> =>
        put<Bounty>(`${BOUNTIES_ENDPOINT}/${id}`, data),

    delete: (id: string): Promise<void> =>
        del<void>(`${BOUNTIES_ENDPOINT}/${id}`),

    claim: (id: string): Promise<Bounty> =>
        post<Bounty>(`${BOUNTIES_ENDPOINT}/${id}/claim`),
};

// Parse and validate response (use when strict validation needed)
export function parseBounty(data: unknown): Bounty {
    return bountySchema.parse(data);
}

export function parseBountyList(data: unknown): Bounty[] {
    return z.array(bountySchema).parse(data);
}
