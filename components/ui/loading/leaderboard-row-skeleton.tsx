import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 border-b border-border/60">
      {/* Rank */}
      <Skeleton className="h-5 w-10 rounded" />
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
      {/* Tier (hidden on small screens) */}
      <Skeleton className="h-5 w-16 rounded hidden md:block" />
      {/* Score */}
      <Skeleton className="h-5 w-12 rounded text-right" />
      {/* Completed (hidden on small screens) */}
      <Skeleton className="h-5 w-10 rounded text-right hidden sm:block" />
      {/* Earnings (hidden on smaller screens) */}
      <Skeleton className="h-5 w-16 rounded text-right hidden lg:block" />
      {/* Streak */}
      <Skeleton className="h-5 w-10 rounded text-right" />
    </div>
  );
}

export function LeaderboardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <LeaderboardRowSkeleton key={i} />
      ))}
    </div>
  );
}
