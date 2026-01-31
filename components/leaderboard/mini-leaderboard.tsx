"use client";

import { useTopContributors } from "@/hooks/use-leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/reputation/tier-badge";
import { Trophy, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MiniLeaderboardProps {
    className?: string;
    limit?: number;
    title?: string;
}

export function MiniLeaderboard({
    className,
    limit = 5,
    title = "Top Contributors"
}: MiniLeaderboardProps) {
    const { data: contributors, isLoading, error } = useTopContributors(limit);

    if (error) {
        // Quiet failure for sidebars - or minimal error state
        return (
            <Card className={cn("border-border/50 bg-background-card", className)}>
                <CardContent className="py-6 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed to load leaderboard</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("border-border/50 bg-background-card overflow-hidden", className)}>
            <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    {title}
                </CardTitle>
                <Link href="/leaderboard" className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center">
                    View All <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="space-y-1 p-2">
                        {Array.from({ length: limit }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-1 flex-1">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-2 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {contributors?.map((contributor, index) => (
                            <Link
                                key={contributor.id}
                                href={`/profile/${contributor.userId}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0 group"
                            >
                                <div className="flex-shrink-0 relative">
                                    <Avatar className="h-9 w-9 border border-border/50">
                                        <AvatarImage src={contributor.avatarUrl || undefined} />
                                        <AvatarFallback>{contributor.displayName?.[0] ?? "?"}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -top-1 -left-1 text-foreground flex items-center justify-center w-4 h-4 rounded-full bg-background border border-border text-[10px] font-bold">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground text-sm truncate group-hover:text-muted-foreground transition-colors">
                                            {contributor.displayName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <TierBadge tier={contributor.tier} className="h-4 text-[10px] px-1.5 py-0" />
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {contributor.totalScore.toLocaleString()} pts
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <div className="p-2">
                            <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground hover:text-foreground" asChild>
                                <Link href="/leaderboard">
                                    See full rankings
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
