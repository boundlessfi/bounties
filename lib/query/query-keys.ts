import { useBountyQuery, type BountyQueryInput } from "@/lib/graphql/generated";

/**
 * Query Key Factory for Bounties
 */
export const bountyKeys = {
  all: ["Bounties"] as const,
  lists: () => [...bountyKeys.all, "lists"] as const,
  list: (params?: BountyQueryInput) =>
    [...bountyKeys.lists(), { query: params }] as const,
  infinite: (params?: Omit<BountyQueryInput, "page">) =>
    [...bountyKeys.lists(), "infinite", { query: params }] as const,
  details: () => [...bountyKeys.all, "details"] as const,
  detail: (id: string) => useBountyQuery.getKey({ id }),
};

// Type helpers for query keys
export type BountyQueryKey =
  | ReturnType<typeof bountyKeys.list>
  | ReturnType<typeof bountyKeys.infinite>
  | ReturnType<typeof bountyKeys.detail>;

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
