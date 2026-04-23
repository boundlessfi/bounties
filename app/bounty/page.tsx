"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useBounties } from "@/hooks/use-bounties";
import { useDebounce } from "@/hooks/use-debounce";
import { BountyCard } from "@/components/bounty/bounty-card";
import { BountyListSkeleton } from "@/components/bounty/bounty-card-skeleton";
import { BountyError } from "@/components/bounty/bounty-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import { MiniLeaderboard } from "@/components/leaderboard/mini-leaderboard";
import {
  BountyStatus,
  BountyType,
  type BountyQueryInput,
} from "@/lib/graphql/generated";

const BOUNTY_TYPES: { value: BountyType; label: string }[] = [
  { value: BountyType.FixedPrice, label: "Fixed Price" },
  { value: BountyType.MilestoneBased, label: "Milestone Based" },
  { value: BountyType.Competition, label: "Competition" },
];

const STATUSES: { value: BountyStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: BountyStatus.Open, label: "Open" },
  { value: BountyStatus.InProgress, label: "In Progress" },
  { value: BountyStatus.Completed, label: "Completed" },
  { value: BountyStatus.Cancelled, label: "Cancelled" },
  { value: BountyStatus.Draft, label: "Draft" },
  { value: BountyStatus.Submitted, label: "Submitted" },
  { value: BountyStatus.UnderReview, label: "Under Review" },
  { value: BountyStatus.Disputed, label: "Disputed" },
];

function getSortParams(sortOption: string) {
  switch (sortOption) {
    case "highest_reward":
      return { sortBy: "rewardAmount", sortOrder: "desc" };
    case "recently_updated":
      return { sortBy: "updatedAt", sortOrder: "desc" };
    case "newest":
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}

export default function BountiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<BountyType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BountyStatus | "all">("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [page, setPage] = useState(1);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  // When the user clears the search input, drop the filter immediately instead
  // of waiting for the debounce to flush the stale value.
  const effectiveSearchQuery = searchQuery === "" ? "" : debouncedSearchQuery;

  const queryParams: BountyQueryInput = useMemo(
    () => ({
      page,
      limit: 20,
      ...(effectiveSearchQuery && { search: effectiveSearchQuery }),
      ...(selectedType !== "all" && { type: selectedType }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...getSortParams(sortOption),
    }),
    [page, effectiveSearchQuery, selectedType, statusFilter, sortOption],
  );

  const { data, isLoading, isError, error, refetch } = useBounties(queryParams);

  const bounties = data?.data ?? [];
  const pagination = data?.pagination;
  const totalResults = pagination?.total ?? 0;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 1;

  const toggleType = (type: BountyType) => {
    setSelectedType((prev) => (prev === type ? "all" : type));
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status as BountyStatus | "all");
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setStatusFilter("all");
    setSortOption("newest");
    setPage(1);
  };

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="min-h-screen  text-foreground pb-20 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-125 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="mb-10 text-center lg:text-left border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Explore <span className="text-primary">Bounties</span>
          </h1>
          <p className=" max-w-2xl text-lg leading-relaxed">
            Discover and contribute to open source projects. Fix bugs, build
            features, and earn rewards in crypto.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-70 shrink-0 space-y-8">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider  flex items-center gap-2">
                    <Filter className="size-4" /> Filters
                  </h2>
                  {(searchQuery ||
                    selectedType !== "all" ||
                    statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-6 text-[10px] text-primary hover:text-primary/80 p-0 hover:bg-transparent"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Search</Label>
                    <div className="relative group">
                      <Search className="absolute left-3 top-2.5 size-4  group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Keywords..."
                        className="pl-9 h-9 text-sm"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-400">
                      Status
                    </Label>
                    <Select
                      value={statusFilter}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-full border-gray-700 hover:border-gray-600 focus:border-primary/50 h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-px border-primary/30">
                        {STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-gray-800/50" />

                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="type"
                    className="w-full"
                  >
                    <AccordionItem value="type" className="border-none">
                      <AccordionTrigger className="text-xs font-medium  hover:no-underline">
                        BOUNTY TYPE
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {BOUNTY_TYPES.map((type) => (
                            <div
                              key={type.value}
                              className="flex items-center space-x-2.5 group"
                            >
                              <Checkbox
                                id={`type-${type.value}`}
                                checked={selectedType === type.value}
                                onCheckedChange={() => toggleType(type.value)}
                                className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <Label
                                htmlFor={`type-${type.value}`}
                                className="text-sm font-normal cursor-pointer transition-colors"
                              >
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <p className="text-xs text-muted-foreground">
                    Organization and reward-range filters are temporarily
                    unavailable in this view because they are not yet supported
                    by the backend query.
                  </p>
                </div>
              </div>

              <div className="hidden lg:block">
                <MiniLeaderboard className="w-full" />
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4   backdrop-blur-sm">
              <div className="text-sm ">
                <span className="font-semibold ">{totalResults}</span> results
                found
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm hidden sm:inline font-medium">
                  Sort by:
                </span>
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-44 focus:border-primary/50 h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="highest_reward">
                      Highest Reward
                    </SelectItem>
                    <SelectItem value="recently_updated">
                      Recently Updated
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <BountyListSkeleton count={6} />
            ) : isError ? (
              <BountyError
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to load bounties"
                }
                onRetry={() => refetch()}
              />
            ) : bounties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                  {bounties.map((bounty) => (
                    <Link
                      key={bounty.id}
                      href={`/bounty/${bounty.id}`}
                      className="h-full block"
                    >
                      <BountyCard bounty={bounty} />
                    </Link>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasPreviousPage}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasNextPage}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-800 rounded-2xl bg-background-card/30">
                <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                  <Search className="size-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-200">
                  No bounties found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  We couldn&apos;t find any bounties matching your current
                  filters. Try adjusting your search terms or filters.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
