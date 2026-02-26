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
import { formatPaginatedBounties } from "@/lib/utils/pagination";

/** Default number of bounties to fetch per page */
const DEFAULT_LIMIT = 20;

/**
 * Hook for fetching bounties with infinite scroll pagination from GraphQL API
 *
 * This hook uses React Query's `useInfiniteQuery` to manage paginated data fetching
 * with automatic pagination handling. It fetches the next page of results as needed
 * and maintains accumulated data across pages.
 *
 * The hook automatically manages:
 * - Pagination state (current page, items per page)
 * - Loading and error states
 * - Next/previous page determination
 * - Result accumulation and flattening
 *
 * @param params - Query parameters (page is omitted, determined by pagination)
 * @returns Infinite query result with pages array and pagination functions
 *
 * @example
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteBounties({
 *   limit: 20,
 *   search: "security"
 * });
 *
 * const allBounties = data?.pages.flatMap(page => page.data) ?? [];
 *
 * return (
 *   <InfiniteScroll
 *     dataLength={allBounties.length}
 *     next={fetchNextPage}
 *     hasMore={hasNextPage ?? false}
 *     loader={<Spinner />}
 *   >
 *     {allBounties.map(bounty => (
 *       <BountyCard key={bounty.id} bounty={bounty} />
 *     ))}
 *   </InfiniteScroll>
 * );
 */
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
      const paginatedData = response.bounties;
      return formatPaginatedBounties(
        paginatedData.bounties as BountyFieldsFragment[],
        paginatedData.total,
        paginatedData.limit,
        pageParam as number,
      );
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
