import {
  useBountyQuery,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";

interface UseBountyOptions {
  enabled?: boolean;
}

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
