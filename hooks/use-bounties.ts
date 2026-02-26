import {
  useBountiesQuery,
  type BountyQueryInput,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";
import { bountyKeys } from "@/lib/query/query-keys";
import { formatPaginatedBounties } from "@/lib/utils/pagination";

export { bountyKeys };

/**
 * Hook for fetching a paginated list of bounties from GraphQL API
 *
 * This hook wraps the generated `useBountiesQuery` and transforms the GraphQL
 * PaginatedBounties response to the internal PaginatedResponse format expected by UI components.
 *
 * @param params - Query parameters including page, limit, filters, and search
 * @returns Object containing bounties data, pagination info, and query status (loading, error, etc.)
 *
 * @example
 * const { data, isLoading, error } = useBounties({
 *   page: 1,
 *   limit: 20,
 *   search: "security"
 * });
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <div>
 *     {data?.data.map(bounty => <BountyCard key={bounty.id} bounty={bounty} />)}
 *     <Pagination
 *       page={data?.pagination.page}
 *       totalPages={data?.pagination.totalPages}
 *     />
 *   </div>
 * );
 */
export function useBounties(params?: BountyQueryInput) {
  const { data, ...rest } = useBountiesQuery({ query: params });

  return {
    ...rest,
    data: data
      ? formatPaginatedBounties(
          data.bounties.bounties as BountyFieldsFragment[],
          data.bounties.total,
          data.bounties.limit,
          params?.page ?? 1,
        )
      : undefined,
  };
}
