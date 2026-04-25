import Link from "next/link";
import { useUserRank } from "@/hooks/use-leaderboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, TrendingUp, Award, Coins } from "lucide-react";
import { TierBadge } from "@/components/reputation/tier-badge";
import { StreakBadge } from "@/components/reputation/streak-badge";
import { RankBadge } from "./rank-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

interface UserRankSidebarProps {
  userId?: string;
  /**
   * Pass true while the auth session is still resolving (authClient.useSession()
   * isPending). This prevents the unauthenticated empty state from flashing
   * briefly for logged-in users before their session data arrives.
   */
  isSessionPending?: boolean;
}

// ---------------------------------------------------------------------------
// Reusable skeleton extracted so it can be used in both the isLoading and
// isSessionPending branches without duplicating JSX.
// ---------------------------------------------------------------------------
function SidebarSkeleton() {
  return (
    <Card className="bg-background-card border-border/50">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

export function UserRankSidebar({
  userId,
  isSessionPending,
}: UserRankSidebarProps) {
  const { data, isLoading, error } = useUserRank(userId);

  // 1. Session is still being resolved — show skeleton so authenticated users
  //    don't see the "Sign in" empty state flash before their data arrives.
  if (isSessionPending) {
    return <SidebarSkeleton />;
  }

  // 2. No authenticated user — show a polished call-to-action.
  if (!userId) {
    return (
      <Card className="bg-background-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-foreground">
            Your Rank
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
          {/* Decorative icon — hidden from AT */}
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Trophy
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Sign in to see your rank
            </p>
            <p className="text-sm text-muted-foreground">
              Track your position, score, and streak on the leaderboard.
            </p>
          </div>
          {/* Link wraps Button to preserve correct anchor semantics */}
          <Link href={ROUTES.AUTH} className="w-full">
            <Button variant="default" size="sm" className="w-full">
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // 3. Authenticated but waiting for rank data to load.
  if (isLoading) {
    return <SidebarSkeleton />;
  }

  // 4. Authenticated but fetch failed.
  if (error) {
    return (
      <Card className="bg-background-card border-border/50">
        <CardContent className="py-8 text-center text-destructive">
          <p>Failed to load rank</p>
          <p className="text-xs mt-2 text-muted-foreground">
            {(error as Error).message || "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 5. Authenticated but the user has no leaderboard entry yet.
  if (!data) {
    return (
      <Card className="bg-background-card border-border/50">
        <CardContent className="py-8 text-center text-muted-foreground">
          Rank not found
        </CardContent>
      </Card>
    );
  }

  const { contributor, rank } = data;

  return (
    <Card className="bg-background-card border-border/50 sticky top-24">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-foreground">
          Your Rank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={contributor.avatarUrl || undefined} />
              <AvatarFallback>{contributor.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <RankBadge
                rank={rank}
                className="w-8 h-8 text-sm bg-background border border-border text-foreground"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate text-foreground">
              {contributor.displayName}
            </h3>
            <TierBadge tier={contributor.tier} className="mt-1" />
          </div>
        </div>

        <Separator className="bg-gray-800/50" />

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
              <Trophy className="h-3 w-3" aria-hidden="true" /> Score
            </div>
            <div className="text-xl font-bold font-mono text-foreground">
              {contributor.totalScore.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
              <Coins className="h-3 w-3" aria-hidden="true" /> Earnings
            </div>
            <div className="text-xl font-bold font-mono text-foreground">
              ${contributor.stats.totalEarnings.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
              <Award className="h-3 w-3" aria-hidden="true" /> Completed
            </div>
            <div className="text-xl font-bold font-mono text-foreground">
              {contributor.stats.totalCompleted}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
              <TrendingUp className="h-3 w-3" aria-hidden="true" /> Rate
            </div>
            <div className="text-xl font-bold font-mono text-foreground">
              {Math.round(contributor.stats.completionRate)}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm bg-background/50 p-2 rounded-lg border border-border/50">
          <span className="text-muted-foreground">Current</span>
          <StreakBadge streak={contributor.stats.currentStreak} />
        </div>

        {/* Progress to Next Tier */}
        {(() => {
          // TODO: remove mock values once API provides them
          const currentPoints =
            contributor.stats.currentTierPoints ?? contributor.totalScore;
          // Mock threshold logic for display if missing: next tier is roughly 2x current score or fixed steps
          const nextThreshold =
            contributor.stats.nextTierThreshold ?? contributor.totalScore * 1.5;

          if (nextThreshold > 0) {
            const progressPercent = Math.min(
              100,
              Math.max(0, (currentPoints / nextThreshold) * 100),
            );
            return (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium uppercase">
                    Progress to Next Tier
                  </span>
                  <span className="text-foreground font-mono">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            );
          }
          return null;
        })()}
      </CardContent>
    </Card>
  );
}
