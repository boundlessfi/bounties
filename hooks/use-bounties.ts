import { useQuery } from "@tanstack/react-query";
import {
  bountiesApi,
  type Bounty,
  type BountyListParams,
  type PaginatedResponse,
} from "@/lib/api";
import { bountyKeys } from "@/lib/query/query-keys";

export function useBounties(params?: BountyListParams) {
  return useQuery<PaginatedResponse<Bounty>>({
    queryKey: bountyKeys.list(params),
    queryFn: () => bountiesApi.list(params),
  });
}
