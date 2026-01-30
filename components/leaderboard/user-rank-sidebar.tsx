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

interface UserRankSidebarProps {
    userId?: string;
}

export function UserRankSidebar({ userId }: UserRankSidebarProps) {
    const { data, isLoading, error } = useUserRank(userId);

    if (!userId) {
        return (
            <Card className="bg-background-card border-border/50">
                <CardContent className="py-8 text-center text-muted-foreground">
                    <p>Connect your wallet to see your rank</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
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

    if (error) {
        return (
            <Card className="bg-background-card border-border/50">
                <CardContent className="py-8 text-center text-destructive">
                    <p>Failed to load rank</p>
                    <p className="text-xs mt-2 text-muted-foreground">{(error as Error).message || "Unknown error"}</p>
                </CardContent>
            </Card>
        );
    }

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
                <CardTitle className="text-lg font-medium text-foreground">Your Rank</CardTitle>
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
                            <RankBadge rank={rank} className="w-8 h-8 text-sm bg-background border border-border text-foreground" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate text-foreground">{contributor.displayName}</h3>
                        <TierBadge tier={contributor.tier} className="mt-1" />
                    </div>
                </div>

                <Separator className="bg-gray-800/50" />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
                            <Trophy className="h-3 w-3" /> Score
                        </div>
                        <div className="text-xl font-bold font-mono text-foreground">
                            {contributor.totalScore.toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
                            <Coins className="h-3 w-3" /> Earnings
                        </div>
                        <div className="text-xl font-bold font-mono text-foreground">
                            ${contributor.stats.totalEarnings.toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
                            <Award className="h-3 w-3" /> Completed
                        </div>
                        <div className="text-xl font-bold font-mono text-foreground">
                            {contributor.stats.totalCompleted}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-medium">
                            <TrendingUp className="h-3 w-3" /> Rate
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
                    const currentPoints = contributor.stats.currentTierPoints ?? contributor.totalScore;
                    // Mock threshold logic for display if missing: next tier is roughly 2x current score or fixed steps
                    const nextThreshold = contributor.stats.nextTierThreshold ?? (contributor.totalScore * 1.5);

                    if (nextThreshold > 0) {
                        const progressPercent = Math.min(100, Math.max(0, (currentPoints / nextThreshold) * 100));
                        return (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium uppercase">Progress to Next Tier</span>
                                    <span className="text-foreground font-mono">{Math.round(progressPercent)}%</span>
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
