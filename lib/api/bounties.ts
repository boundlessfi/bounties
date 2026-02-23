import { z } from "zod";
import { get, post, put, del } from "./client";
import type { PaginatedResponse, PaginationParams, SortParams } from "./types";

// Bounty schemas — aligned with backend GraphQL enums
const bountyTypeSchema = z.enum([
  "FIXED_PRICE",
  "MILESTONE_BASED",
  "COMPETITION",
]);
const bountyStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "DISPUTED",
]);

const bountyOrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  slug: z.string().nullable(),
});

const bountyProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
});

export const bountySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: bountyTypeSchema,
  status: bountyStatusSchema,

  organizationId: z.string(),
  organization: bountyOrganizationSchema.nullable().optional(),
  projectId: z.string().nullable(),
  project: bountyProjectSchema.nullable().optional(),

  githubIssueUrl: z.string(),
  githubIssueNumber: z.number().nullable(),

  rewardAmount: z.number(),
  rewardCurrency: z.string(),

  bountyWindowId: z.string().nullable().optional(),

  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Bounty = z.infer<typeof bountySchema>;
export type BountyType = z.infer<typeof bountyTypeSchema>;
export type BountyStatus = z.infer<typeof bountyStatusSchema>;

// Query params
export interface BountyListParams extends PaginationParams, SortParams {
  status?: BountyStatus;
  type?: BountyType;
  organizationId?: string;
  projectId?: string;
  bountyWindowId?: string;
  search?: string;
}

// Create bounty input
export const createBountySchema = bountySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  createdBy: true,
  organization: true,
  project: true,
});

export type CreateBountyInput = z.infer<typeof createBountySchema>;

// Update bounty input
export const updateBountySchema = createBountySchema.partial();

export type UpdateBountyInput = z.infer<typeof updateBountySchema>;

// API endpoints
const BOUNTIES_ENDPOINT = "/api/bounties";

export const bountiesApi = {
  list: (params?: BountyListParams): Promise<PaginatedResponse<Bounty>> => {
    const queryParams: Record<string, unknown> = { ...params };
    return get<PaginatedResponse<Bounty>>(BOUNTIES_ENDPOINT, {
      params: queryParams,
    });
  },

  getById: (id: string): Promise<Bounty> =>
    get<Bounty>(`${BOUNTIES_ENDPOINT}/${id}`),

  create: (data: CreateBountyInput): Promise<Bounty> =>
    post<Bounty>(BOUNTIES_ENDPOINT, data),

  update: (id: string, data: UpdateBountyInput): Promise<Bounty> =>
    put<Bounty>(`${BOUNTIES_ENDPOINT}/${id}`, data),

  delete: (id: string): Promise<void> =>
    del<void>(`${BOUNTIES_ENDPOINT}/${id}`),

  claim: (id: string, contributorId?: string): Promise<Bounty> => {
    const body = contributorId ? { contributorId } : {};
    return post<Bounty>(`${BOUNTIES_ENDPOINT}/${id}/claim`, body);
  },
};

// Parse and validate response (use when strict validation needed)
export function parseBounty(data: unknown): Bounty {
  return bountySchema.parse(data);
}

export function parseBountyList(data: unknown): Bounty[] {
  return z.array(bountySchema).parse(data);
}
