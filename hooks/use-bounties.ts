import {
  useBountiesQuery,
  useBountyQuery,
  type BountyQueryInput,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";

export const bountyKeys = {
  all: ["Bounties"] as const,
  lists: () => ["Bounties"] as const,
  list: (params?: BountyQueryInput) =>
    useBountiesQuery.getKey({ query: params }),
  details: () => ["Bounty"] as const,
  detail: (id: string) => useBountyQuery.getKey({ id }),
};

export function useBounties(params?: BountyQueryInput) {
  const { data, ...rest } = useBountiesQuery({ query: params });

  return {
    ...rest,
    data: data
      ? {
          data: data.bounties.bounties as BountyFieldsFragment[],
          pagination: {
            page: params?.page ?? 1,
            limit: data.bounties.limit,
            total: data.bounties.total,
            totalPages: Math.ceil(data.bounties.total / data.bounties.limit),
          },
        }
      : undefined,
  };
}
