import { useInfiniteQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/graphql/client";
import {
  BountiesDocument,
  type BountiesQuery,
  type BountyQueryInput,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";
import { type PaginatedResponse } from "@/lib/api/types";
import { bountyKeys } from "./use-bounties";

const DEFAULT_LIMIT = 20;

export function useInfiniteBounties(params?: Omit<BountyQueryInput, "page">) {
  return useInfiniteQuery<PaginatedResponse<BountyFieldsFragment>>({
    queryKey: [...bountyKeys.lists(), "infinite", params] as const,
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
          totalPages: Math.ceil(data.total / data.limit),
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

/**
 * Helper to flatten infinite query pages
 */
export function flattenBountyPages(
  pages: PaginatedResponse<BountyFieldsFragment>[] | undefined,
): BountyFieldsFragment[] {
  return pages?.flatMap((page) => page.data) ?? [];
}
