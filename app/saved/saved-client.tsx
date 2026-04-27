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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No saved bounties yet</h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          Bookmark interesting bounties to save them here for later review.
        </p>
        <Button asChild>
          <Link href="/">Explore Bounties</Link>
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
