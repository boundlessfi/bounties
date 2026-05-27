"use client";

import { useBookmarks } from "@/hooks/use-bookmarks";
import { BountyCard } from "@/components/bounty/bounty-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type {
  Bookmark as BookmarkType,
  Bounty as BountyType,
} from "@/lib/graphql/generated";

function SavedBountiesClient() {
  const { data: bookmarks, isLoading, error } = useBookmarks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          Failed to load saved bounties. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Filter out any bookmarks with null bounty (defensive check)
  const bookmarkedBounties = (bookmarks ?? [])
    .filter((b): b is BookmarkType => b.bounty !== null)
    .map((b) => b.bounty as BountyType);

  if (bookmarkedBounties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-800 rounded-2xl bg-background-card/30">
        <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
          <Bookmark className="size-8 text-gray-600" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-200">
          No saved bounties yet
        </h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          Bookmark interesting bounties to save them here for later review.
        </p>
        <Button
          asChild
          variant="outline"
          className="border-gray-700 hover:bg-gray-800"
        >
          <Link href="/bounty">Browse bounties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarkedBounties.map((bounty) => (
        <BountyCard
          key={bounty.id}
          bounty={bounty}
          onClick={() => {
            window.location.href = `/bounty/${bounty.id}`;
          }}
        />
      ))}
    </div>
  );
}

export default SavedBountiesClient;
