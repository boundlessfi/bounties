import {
  useBountyQuery,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";

interface UseBountyOptions {
  enabled?: boolean;
}

// Reusable hook to fetch a single bounty by ID via GraphQL using the generated useBountyQuery hook.
// Returns the bounty data typed as BountyFieldsFragment, which includes all relations
// (organization, project, bountyWindow, submissions). Accepts an optional `enabled` flag
// for external control over when the query fires, falling back to !!id as the default guard.

export function useBounty(id: string, options?: UseBountyOptions) {
  const { data, ...rest } = useBountyQuery(
    { id },
    { enabled: options?.enabled ?? !!id },
  );

  return {
    ...rest,
    data: data?.bounty as BountyFieldsFragment | undefined,
  };
}
