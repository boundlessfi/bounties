import {
  useBountiesQuery,
  type BountyQueryInput,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";
import { bountyKeys } from "@/lib/query/query-keys";

export { bountyKeys };

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
            totalPages:
              data.bounties.limit > 0
                ? Math.ceil(data.bounties.total / data.bounties.limit)
                : 0,
          },
        }
      : undefined,
  };
}
