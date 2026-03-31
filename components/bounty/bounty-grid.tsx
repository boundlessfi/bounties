"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { type BountyFieldsFragment } from "@/lib/graphql/generated";
import { BountyCard } from "@/components/bounty/bounty-card";
import { BountyListSkeleton } from "@/components/bounty/bounty-card-skeleton";
import { BountyError } from "@/components/bounty/bounty-error";
import { Button } from "@/components/ui/button";

interface BountyGridProps {
  bounties: BountyFieldsFragment[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function BountyGrid({
  bounties,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onClearFilters,
}: BountyGridProps) {
  if (isLoading) {
    return <BountyListSkeleton count={6} />;
  }

  if (isError) {
    return <BountyError message={errorMessage} onRetry={onRetry} />;
  }

  if (bounties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-800 rounded-2xl bg-background-card/30">
        <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
          <Search className="size-8 text-gray-600" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-200">
          No bounties found
        </h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          We couldn&apos;t find any bounties matching your current filters. Try
          adjusting your search terms or filters.
        </p>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="border-gray-700 hover:bg-gray-800"
        >
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
      {bounties.map((bounty) => (
        <Link
          key={bounty.id}
          href={`/bounty/${bounty.id}`}
          className="h-full block"
        >
          <BountyCard bounty={bounty} />
        </Link>
      ))}
    </div>
  );
}
