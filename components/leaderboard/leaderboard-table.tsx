"use client";
import React, { useEffect, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardEntry } from "@/types/leaderboard";
import { cn } from "@/lib/utils";
import { RankBadge } from "./rank-badge";
import { TierBadge } from "@/components/reputation/tier-badge";
import { StreakBadge } from "@/components/reputation/streak-badge";

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    isLoading: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onLoadMore: () => void;
    currentUserId?: string;
    onRowClick?: (entry: LeaderboardEntry) => void;
}

export function LeaderboardTable({
    entries,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    currentUserId,
    onRowClick,
}: LeaderboardTableProps) {
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [hasNextPage, onLoadMore, isFetchingNextPage]);

    if (isLoading && entries.length === 0) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    const handleKeyDown = (e: React.KeyboardEvent, entry: LeaderboardEntry) => {
        if (onRowClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onRowClick(entry);
        }
    };

    return (
        <div className="rounded-md border border-border/50 overflow-hidden bg-background-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="w-[80px] text-center font-bold text-foreground">RANK</TableHead>
                        <TableHead className="font-bold text-foreground">CONTRIBUTOR</TableHead>
                        <TableHead className="hidden md:table-cell font-bold text-foreground">TIER</TableHead>
                        <TableHead className="text-right font-bold text-foreground">SCORE</TableHead>
                        <TableHead className="text-right hidden sm:table-cell font-bold text-foreground">COMPLETED</TableHead>
                        <TableHead className="text-right hidden lg:table-cell font-bold text-foreground">EARNINGS</TableHead>
                        <TableHead className="text-right font-bold text-foreground">STREAK</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => {
                        const isCurrentUser = currentUserId === entry.contributor.userId;

                        return (
                            <TableRow
                                key={entry.contributor.id}
                                className={cn(
                                    "border-b border-border/60 hover:bg-muted/20",
                                    isCurrentUser && "bg-secondary/40",
                                    onRowClick && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:z-10 relative"
                                )}
                                tabIndex={onRowClick ? 0 : undefined}
                                role={onRowClick ? "row" : undefined}
                                onClick={onRowClick ? () => onRowClick(entry) : undefined}
                                onKeyDown={onRowClick ? (e) => handleKeyDown(e, entry) : undefined}
                            >
                                <TableCell className="text-center font-medium">
                                    <div className="flex justify-center">
                                        <RankBadge rank={entry.rank} />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-border/60">
                                            <AvatarImage src={entry.contributor.avatarUrl || undefined} />
                                            <AvatarFallback className="bg-secondary text-secondary-foreground">{entry.contributor.displayName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className={cn("font-semibold text-foreground", isCurrentUser && "text-primary")}>
                                                {entry.contributor.displayName}
                                                {isCurrentUser && " (You)"}
                                            </span>
                                            <div className="flex gap-1 md:hidden">
                                                <span className="text-xs text-muted-foreground">{entry.contributor.tier}</span>
                                            </div>
                                            <div className="flex gap-1 mt-1 md:hidden">
                                                {entry.contributor.topTags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] bg-muted px-1 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Desktop tags */}
                                    <div className="hidden md:flex gap-1 mt-2">
                                        {entry.contributor.topTags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] px-1 h-5 font-normal">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-foreground">
                                    <TierBadge tier={entry.contributor.tier} />
                                </TableCell>
                                <TableCell className="text-right font-mono text-foreground font-medium">
                                    {entry.contributor.totalScore.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right hidden sm:table-cell text-foreground">
                                    {entry.contributor.stats.totalCompleted}
                                </TableCell>
                                <TableCell className="text-right hidden lg:table-cell font-mono text-foreground">
                                    ${entry.contributor.stats.totalEarnings.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <StreakBadge streak={entry.contributor.stats.currentStreak} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {isFetchingNextPage && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                                <div className="flex items-center justify-center text-muted-foreground text-sm">
                                    Loading more...
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {hasNextPage && <div ref={loadMoreRef} className="h-4" />}
        </div>
    );
}
