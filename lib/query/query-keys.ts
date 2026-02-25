import {
  useBountiesQuery,
  useBountyQuery,
  useActiveBountiesQuery,
  useOrganizationBountiesQuery,
  useProjectBountiesQuery,
  type BountyQueryInput,
  type BountiesQueryVariables,
  type BountyQueryVariables,
  type ActiveBountiesQueryVariables,
  type OrganizationBountiesQueryVariables,
  type ProjectBountiesQueryVariables,
} from "@/lib/graphql/generated";

/**
 * Query Key Factory for Bounties
 * Uses codegen-generated query keys with proper variable wrapping
 */
export const bountyKeys = {
  // All bounties list queries - uses ["Bounties"] or ["Bounties", variables]
  lists: () => useBountiesQuery.getKey(),
  list: (params?: BountyQueryInput) =>
    useBountiesQuery.getKey({ query: params } as BountiesQueryVariables),

  // Infinite bounties queries - uses same base key as list since they fetch same data
  infinite: (params?: Omit<BountyQueryInput, "page">) =>
    [
      ...useBountiesQuery.getKey({ query: params } as BountiesQueryVariables),
      "infinite",
    ] as const,

  // Single bounty detail - uses ["Bounty", variables]
  detail: (id: string) => useBountyQuery.getKey({ id } as BountyQueryVariables),

  // Active bounties - uses ["ActiveBounties"] or ["ActiveBounties", variables]
  active: (variables?: ActiveBountiesQueryVariables) =>
    useActiveBountiesQuery.getKey(variables),

  // Organization bounties - uses ["OrganizationBounties", variables]
  organization: (organizationId: string) =>
    useOrganizationBountiesQuery.getKey({
      organizationId,
    } as OrganizationBountiesQueryVariables),

  // Project bounties - uses ["ProjectBounties", variables]
  project: (projectId: string) =>
    useProjectBountiesQuery.getKey({
      projectId,
    } as ProjectBountiesQueryVariables),
};

// Type helpers for query keys
export type BountyQueryKey =
  | ReturnType<typeof bountyKeys.list>
  | ReturnType<typeof bountyKeys.infinite>
  | ReturnType<typeof bountyKeys.detail>;

/**
 * Query Key Factory for Submissions
 */
export const submissionKeys = {
  all: ["Submissions"] as const,
  lists: () => [...submissionKeys.all, "lists"] as const,
  list: (bountyId: string) =>
    [...submissionKeys.lists(), { bountyId }] as const,
  detail: (id: string) => [...submissionKeys.all, "detail", id] as const,
  byBounty: (bountyId: string) =>
    [...submissionKeys.all, "byBounty", bountyId] as const,
};

export type SubmissionQueryKey =
  | ReturnType<typeof submissionKeys.list>
  | ReturnType<typeof submissionKeys.detail>
  | ReturnType<typeof submissionKeys.byBounty>;

/**
 * Query Key Factory for Authentication
 *
 * Hierarchical structure for auth/user cache management:
 * - authKeys.all → invalidates everything auth-related
 * - authKeys.session() → invalidates session data
 */
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export const complianceKeys = {
  all: ["compliance"] as const,
  status: () => [...complianceKeys.all, "status"] as const,
};

export const termsKeys = {
  all: ["terms"] as const,
  current: () => [...termsKeys.all, "current"] as const,
};

export const withdrawalKeys = {
  all: ["withdrawal"] as const,
  history: () => [...withdrawalKeys.all, "history"] as const,
};
