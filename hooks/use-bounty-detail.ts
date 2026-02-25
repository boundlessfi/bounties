import {
  useBountyQuery,
  type BountyQuery,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";

// Fetches a single bounty by ID via GraphQL using the generated useBountyQuery hook.
// Returns the bounty data typed as BountyFieldsFragment, which includes all relations
// (organization, project, bountyWindow, submissions). Query is skipped if no id is provided.

export function useBountyDetail(id: string) {
  const { data, ...rest } = useBountyQuery({ id }, { enabled: Boolean(id) });

  return {
    ...rest,
    data: data?.bounty as
      | (BountyFieldsFragment & Partial<BountyQuery["bounty"]>)
      | undefined,
  };
}
