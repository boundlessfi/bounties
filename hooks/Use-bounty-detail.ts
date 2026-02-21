import { useQuery } from "@tanstack/react-query";
import { bountiesApi, type Bounty } from "@/lib/api";
import { bountyKeys } from "./use-bounties";

export function useBountyDetail(id: string) {
  return useQuery<Bounty>({
    queryKey: bountyKeys.detail(id),
    queryFn: () => bountiesApi.getById(id),
    enabled: Boolean(id),
  });
}
