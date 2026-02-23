import {
  useBountyQuery,
  type BountyFieldsFragment,
} from "@/lib/graphql/generated";

export function useBountyDetail(id: string) {
  const { data, ...rest } = useBountyQuery({ id }, { enabled: Boolean(id) });

  return {
    ...rest,
    data: data?.bounty as BountyFieldsFragment | undefined,
  };
}
