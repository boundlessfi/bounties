"use client";

import { useLeaderboard } from "@/hooks/use-leaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";
import { UserRankSidebar } from "@/components/leaderboard/user-rank-sidebar";
import { LeaderboardFilters as FiltersType, ReputationTier } from "@/types/leaderboard";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TIMEFRAMES, TIERS } from "@/components/leaderboard/leaderboard-filters";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LeaderboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Validate and initialize filters from URL
    const rawTimeframe = searchParams.get("timeframe");
    const rawTier = searchParams.get("tier");

    const initialTimeframe = TIMEFRAMES.some(t => t.value === rawTimeframe)
        ? (rawTimeframe as FiltersType["timeframe"])
        : "ALL_TIME";

    const initialTier = TIERS.some(t => t.value === rawTier)
        ? (rawTier as ReputationTier)
        : undefined;

    const initialTags = searchParams.get("tags") ? searchParams.get("tags")?.split(",") : [];

    const [filters, setFilters] = useState<FiltersType>({
        timeframe: initialTimeframe,
        tier: initialTier,
        tags: initialTags || [],
    });

    // Fake current user ID for demo purposes
    // In a real app this would come from auth context
    const currentUserId = "user-1";

    // Debounce filters to prevent rapid API calls/URL updates
    const [debouncedFilters, setDebouncedFilters] = useState<FiltersType>(filters);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 400);

        return () => clearTimeout(timer);
    }, [filters]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch
    } = useLeaderboard(debouncedFilters, 20);

    // Sync debounced filters to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedFilters.timeframe !== "ALL_TIME") params.set("timeframe", debouncedFilters.timeframe);
        if (debouncedFilters.tier) params.set("tier", debouncedFilters.tier);
        if (debouncedFilters.tags && debouncedFilters.tags.length > 0) {
            params.set("tags", debouncedFilters.tags.join(","));
        }

        router.replace(`/leaderboard?${params.toString()}`, { scroll: false });
    }, [debouncedFilters, router]);

    // Flatten infinite query data
    const entries = data?.pages.flatMap((page) => page.entries) || [];

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Hero Header */}
            <div className="border-b border-border/40">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                        Leaderboard
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Recognizing the top contributors in the ecosystem.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content - Table */}
                    <div className="lg:col-span-3 space-y-6">
                        <LeaderboardFilters
                            filters={filters}
                            onFilterChange={setFilters}
                        />

                        {isError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription className="flex flex-col gap-2">
                                    <p>Failed to load leaderboard data. {(error as Error)?.message}</p>
                                    <Button variant="outline" size="sm" onClick={() => refetch()} className="w-fit bg-background text-foreground border-border hover:bg-muted">
                                        Try Again
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <LeaderboardTable
                                entries={entries}
                                isLoading={isLoading}
                                hasNextPage={hasNextPage || false}
                                isFetchingNextPage={isFetchingNextPage}
                                onLoadMore={() => fetchNextPage()}
                                currentUserId={currentUserId}
                                onRowClick={(entry) => router.push(`/user/${entry.contributor.userId}`)}
                            />
                        )}
                    </div>

                    {/* Sidebar - User Rank */}
                    <div className="lg:col-span-1">
                        <UserRankSidebar userId={currentUserId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
