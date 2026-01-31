"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    LeaderboardFilters as FiltersType,
    LeaderboardTimeframe,
    ReputationTier
} from "@/types/leaderboard";
import { FilterX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardFiltersProps {
    filters: FiltersType;
    onFilterChange: (filters: FiltersType) => void;
}

export const TIMEFRAMES: { value: LeaderboardTimeframe; label: string }[] = [
    { value: "ALL_TIME", label: "All Time" },
    { value: "THIS_MONTH", label: "This Month" },
    { value: "THIS_WEEK", label: "This Week" },
];

export const TIERS: { value: ReputationTier; label: string }[] = [
    { value: "LEGEND", label: "Legend" },
    { value: "EXPERT", label: "Expert" },
    { value: "ESTABLISHED", label: "Established" },
    { value: "CONTRIBUTOR", label: "Contributor" },
    { value: "NEWCOMER", label: "Newcomer" },
];

// Mock available tags for filter - in real app could be passed as prop
const AVAILABLE_TAGS = [
    "Auditing", "Smart Contracts", "DeFi", "Frontend", "Backend",
    "Design", "Documentation", "Testing", "Security", "Zero Knowledge"
];

export function LeaderboardFilters({ filters, onFilterChange }: LeaderboardFiltersProps) {
    const updateFilter = (key: keyof FiltersType, value: unknown) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleTagToggle = (tag: string) => {
        const currentTags = filters.tags ?? [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter((t) => t !== tag)
            : [...currentTags, tag];
        updateFilter("tags", newTags);
    };

    const clearFilters = () => {
        onFilterChange({
            timeframe: "ALL_TIME",
            tier: undefined,
            tags: [],
        });
    };

    const hasActiveFilters = filters.timeframe !== "ALL_TIME" || filters.tier || (filters.tags?.length || 0) > 0;

    return (
        <div className="flex flex-wrap items-center gap-3 text-foreground">
            {/* Timeframe Select */}
            <Select
                value={filters.timeframe}
                onValueChange={(val) => updateFilter("timeframe", val as LeaderboardTimeframe)}
            >
                <SelectTrigger className="w-36 bg-background-card border-border/50">
                    <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                    {TIMEFRAMES.map((tf) => (
                        <SelectItem key={tf.value} value={tf.value}>
                            {tf.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Tier Select */}
            <Select
                value={filters.tier || "all"}
                onValueChange={(val) => updateFilter("tier", val === "all" ? undefined : (val as ReputationTier))}
            >
                <SelectTrigger className="w-35 bg-background-card border-border/50">
                    <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    {TIERS.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                            {tier.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Tags Multi-Select */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 border-border/50 border-dashed">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tags
                        {(filters.tags?.length || 0) > 0 && (
                            <>
                                <div className="hidden space-x-1 lg:flex ml-2">
                                    {(filters.tags?.length ?? 0) > 2 ? (
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            {filters?.tags?.length} selected
                                        </Badge>
                                    ) : (
                                        filters.tags?.map((tag) => (
                                            <Badge
                                                variant="secondary"
                                                key={tag}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {tag}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Tags..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {AVAILABLE_TAGS.map((tag) => {
                                    const isSelected = filters.tags?.includes(tag);
                                    return (
                                        <CommandItem
                                            key={tag}
                                            onSelect={() => handleTagToggle(tag)}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{tag}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            {(filters.tags?.length || 0) > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => updateFilter("tags", [])}
                                            className="justify-center text-center"
                                        >
                                            Clear filters
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Clear Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground h-9 px-2.5"
                >
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    );
}
