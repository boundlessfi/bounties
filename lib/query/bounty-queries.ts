import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { fetcher } from "@/lib/graphql/client";
import {
  BountiesDocument,
  BountyDocument,
  type BountiesQuery,
  type BountyQuery,
  type BountyQueryInput,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";
import { type PaginatedResponse } from "@/lib/api/types";
import { bountyKeys } from "./query-keys";

const DEFAULT_LIMIT = 20;

/**
 * Query options factory for bounty list
 */
export function bountyListQueryOptions(params?: BountyQueryInput) {
  return queryOptions<PaginatedResponse<BountyFieldsFragment>>({
    queryKey: bountyKeys.list(params),
    queryFn: async () => {
      const response = await fetcher<
        BountiesQuery,
        { query: BountyQueryInput }
      >(BountiesDocument, { query: params ?? {} })();
      const data = response.bounties;
      return {
        data: data.bounties as BountyFieldsFragment[],
        pagination: {
          page: params?.page ?? 1,
          limit: data.limit,
          total: data.total,
          totalPages: Math.ceil(data.total / data.limit),
        },
      };
    },
  });
}

/**
 * Query options factory for single bounty
 */
export function bountyDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: bountyKeys.detail(id),
    queryFn: async () => {
      const response = await fetcher<BountyQuery, { id: string }>(
        BountyDocument,
        { id },
      )();
      return response.bounty as BountyFieldsFragment;
    },
    enabled: !!id,
  });
}

/**
 * Infinite query options for bounty pagination
 */
export function bountyInfiniteQueryOptions(
  params?: Omit<BountyQueryInput, "page">,
) {
  return infiniteQueryOptions<PaginatedResponse<BountyFieldsFragment>>({
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
          totalPages: Math.ceil(data.total / data.limit),
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<BountyFieldsFragment>) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
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
