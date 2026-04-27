import {
  useBountyQuery,
  type BountyQuery,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";
import type { Bounty } from "@/types/bounty";

// Fetches a single bounty by ID via GraphQL using the generated useBountyQuery hook.
// Returns the bounty data typed as BountyFieldsFragment intersected with the local
// Bounty type so callers can access optional Model-4 fields (milestones, maxSlots, etc.)
// without unsafe casts. The real data for those fields comes via mock fallbacks in
// getMilestoneData until the GraphQL fragment is extended.

export function useBountyDetail(id: string) {
  const { data, ...rest } = useBountyQuery({ id }, { enabled: Boolean(id) });

  return {
    ...rest,
    data: data?.bounty as
      | (BountyFieldsFragment &
          Partial<BountyQuery["bounty"]> &
          Partial<Bounty>)
      | undefined,
  };
}
