"use client";

import Link from "next/link";
import { BountyCard } from "./bounty-card";
import { BountyListSkeleton } from "./bounty-card-skeleton";
import { BountyError } from "./bounty-error";
import { BountyEmpty } from "./bounty-empty";
import { useBounties } from "@/hooks/use-bounties";
import type { BountyListParams } from "@/lib/api";
import type { Bounty } from "@/types/bounty";

interface BountyListProps {
  params?: BountyListParams;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onBountyClick?: (bounty: Bounty) => void;
}

export function BountyList({
  params,
  hasFilters = false,
  onClearFilters,
  onBountyClick,
}: BountyListProps) {
  const { data, isLoading, isError, error, refetch } = useBounties(params);

  if (isLoading) {
    return <BountyListSkeleton count={6} />;
  }

  if (isError) {
    return (
      <BountyError
        message={
          error instanceof Error ? error.message : "Failed to load bounties"
        }
        onRetry={() => refetch()}
      />
    );
  }

  const bounties = data?.data ?? [];

  if (bounties.length === 0) {
    return (
      <BountyEmpty hasFilters={hasFilters} onClearFilters={onClearFilters} />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
      {bounties.map((bounty) => (
        <div key={bounty.id} className="h-full">
          {onBountyClick ? (
            <BountyCard bounty={bounty} onClick={() => onBountyClick(bounty)} />
          ) : (
            <Link href={`/bounty/${bounty.id}`} className="block h-full">
              <BountyCard bounty={bounty} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
