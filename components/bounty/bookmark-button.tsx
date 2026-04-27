"use client";

import { useMemo } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useBookmarkIds, useToggleBookmark } from "@/hooks/use-bookmarks";
import { authClient } from "@/lib/auth-client";

interface BookmarkButtonProps {
  bountyId: string;
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

/**
 * BookmarkButton component for toggling bookmark state on a bounty.
 *
 * Features:
 * - Instant visual feedback (filled/outline icon)
 * - Optimistic UI updates via React Query
 * - Accessible: aria-pressed, keyboard operable
 * - Handles loading state and errors
 * - Shows disabled state with login tooltip for unauthenticated users
 *
 * @param bountyId - The bounty ID to toggle bookmark for
 * @param size - Button size (default: "md")
 * @param className - Additional CSS classes
 * @param showLabel - Whether to show "Save" / "Saved" label (default: false, icon only)
 */
export function BookmarkButton({
  bountyId,
  size = "md",
  className,
  showLabel = false,
}: BookmarkButtonProps) {
  const { data: session } = authClient.useSession();
  const { data: bookmarkedIds } = useBookmarkIds();
  const toggleMutation = useToggleBookmark();

  const isAuthenticated = Boolean(session?.user);
  const bookmarkedIdsSet = useMemo(() => {
    return new Set(bookmarkedIds ?? []);
  }, [bookmarkedIds]);

  const isBookmarked = useMemo(() => {
    return bookmarkedIdsSet.has(bountyId);
  }, [bookmarkedIdsSet, bountyId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!isAuthenticated) {
      toast.error("Please log in to save bounties");
      return;
    }

    try {
      await toggleMutation.mutateAsync(bountyId);
    } catch {
      // Error handled by mutation hook
    }
  };

  const isLoading = toggleMutation.isPending;

  const iconSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;
  const buttonSize = size === "md" ? "default" : size;

  const button = (
    <Button
      type="button"
      variant="ghost"
      size={
        buttonSize as "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
      }
      className={className}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-pulse">...</span>
      ) : isBookmarked ? (
        <BookmarkCheck
          className={`text-primary fill-current`}
          style={{ width: iconSize, height: iconSize }}
        />
      ) : (
        <Bookmark
          className="text-muted-foreground"
          style={{ width: iconSize, height: iconSize }}
        />
      )}
      {showLabel && (
        <span className="ml-2">{isBookmarked ? "Saved" : "Save"}</span>
      )}
    </Button>
  );

  // If not authenticated, wrap in tooltip to prompt login
  if (!isAuthenticated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>Log in to save bounties</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
