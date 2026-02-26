/**
 * Pagination utility functions for GraphQL responses
 * Converts GraphQL PaginatedBounties response to the internal PaginatedResponse format
 */

import type { PaginatedResponse } from "@/lib/api/types";
import type { BountyFieldsFragment } from "@/lib/graphql/generated";

/**
 * Calculates the total number of pages from total items and limit
 * @param total - Total number of items
 * @param limit - Items per page
 * @returns Total number of pages, or 0 if limit is 0 or invalid
 */
export function calculateTotalPages(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

/**
 * Transforms a GraphQL PaginatedBounties response to the internal PaginatedResponse format
 * Handles the mapping of GraphQL response structure to UI expectations
 *
 * @param bounties - Array of bounty items from GraphQL response
 * @param total - Total count of bounties
 * @param limit - Items per page
 * @param page - Current page number
 * @returns PaginatedResponse with bounties array and pagination metadata
 *
 * @example
 * const response = await bounties query...
 * const formatted = formatPaginatedBounties(
 *   response.bounties.bounties,
 *   response.bounties.total,
 *   response.bounties.limit,
 *   1
 * );
 */
export function formatPaginatedBounties(
  bounties: BountyFieldsFragment[],
  total: number,
  limit: number,
  page: number,
): PaginatedResponse<BountyFieldsFragment> {
  return {
    data: bounties,
    pagination: {
      page,
      limit,
      total,
      totalPages: calculateTotalPages(total, limit),
    },
  };
}
