import { useInfiniteQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/graphql/client";
import {
  BountiesDocument,
  type BountiesQuery,
  type BountyQueryInput,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";
import { type PaginatedResponse } from "@/lib/api/types";
import { bountyKeys } from "@/lib/query/query-keys";

const DEFAULT_LIMIT = 20;

export function useInfiniteBounties(params?: Omit<BountyQueryInput, "page">) {
  return useInfiniteQuery<PaginatedResponse<BountyFieldsFragment>>({
    queryKey: bountyKeys.infinite(params),
    queryFn: async ({ pageParam }) => {
      const response = await fetcher<
        BountiesQuery,
        { query: BountyQueryInput }
      >(BountiesDocument, {
        query: {
          ...params,
          page: pageParam as number,
          limit: params?.limit ?? DEFAULT_LIMIT,
        },
      })();
      const data = response.bounties;
      return {
        data: data.bounties as BountyFieldsFragment[],
        pagination: {
          page: pageParam as number,
          limit: data.limit,
          total: data.total,
          totalPages: data.limit > 0 ? Math.ceil(data.total / data.limit) : 0,
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { page } = firstPage.pagination;
      return page > 1 ? page - 1 : undefined;
    },
  });
}
