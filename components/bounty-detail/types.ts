import { BountyFieldsFragment } from "@/lib/graphql/generated";
import type { Bounty } from "@/types/bounty";

export type SidebarBounty = BountyFieldsFragment & Partial<Bounty>;
