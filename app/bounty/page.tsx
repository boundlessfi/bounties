"use client";

import { useCallback, useMemo, useState } from "react";
import { useBounties } from "@/hooks/use-bounties";
import { BountyListSkeleton } from "@/components/bounty/bounty-card-skeleton";
import { BountyError } from "@/components/bounty/bounty-error";
import {
  FiltersSidebar,
  type FilterOption,
} from "@/components/bounty/filters-sidebar";
import { BountyGrid } from "@/components/bounty/bounty-grid";
import { SearchHeader } from "@/components/bounty/search-header";
import { MiniLeaderboard } from "@/components/leaderboard/mini-leaderboard";

const DEFAULT_REWARD_RANGE: [number, number] = [0, 5000];
const DEFAULT_STATUS_FILTER = "OPEN";
const DEFAULT_SORT_OPTION = "newest";

const BOUNTY_TYPES: FilterOption[] = [
  { value: "FIXED_PRICE", label: "Fixed Price" },
  { value: "MILESTONE_BASED", label: "Milestone Based" },
  { value: "COMPETITION", label: "Competition" },
];

const STATUSES: FilterOption[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "DISPUTED", label: "Disputed" },
  { value: "all", label: "All Statuses" },
];

export default function BountiesPage() {
  const { data, isLoading, isError, error, refetch } = useBounties();
  const allBounties = useMemo(() => data?.data ?? [], [data?.data]);

  const organizations = useMemo(
    () =>
      Array.from(
        new Set(
          allBounties
            .map((bounty) => bounty.organization?.name)
            .filter(Boolean),
        ),
      ).sort() as string[],
    [allBounties],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    [],
  );
  const [rewardRange, setRewardRange] =
    useState<[number, number]>(DEFAULT_REWARD_RANGE);
  const [statusFilter, setStatusFilter] = useState<string>(
    DEFAULT_STATUS_FILTER,
  );
  const [sortOption, setSortOption] = useState<string>(DEFAULT_SORT_OPTION);

  const filteredBounties = useMemo(() => {
    return allBounties
      .filter((bounty) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          searchQuery === "" ||
          bounty.title.toLowerCase().includes(searchLower) ||
          bounty.description.toLowerCase().includes(searchLower);

        const matchesType =
          selectedTypes.length === 0 || selectedTypes.includes(bounty.type);

        const matchesOrganization =
          selectedOrganizations.length === 0 ||
          (bounty.organization?.name &&
            selectedOrganizations.includes(bounty.organization.name));

        const amount = bounty.rewardAmount || 0;
        const matchesReward =
          amount >= rewardRange[0] && amount <= rewardRange[1];

        const matchesStatus =
          statusFilter === "all" || bounty.status === statusFilter;

        return (
          matchesSearch &&
          matchesType &&
          matchesOrganization &&
          matchesReward &&
          matchesStatus
        );
      })
      .sort((left, right) => {
        switch (sortOption) {
          case "highest_reward":
            return (right.rewardAmount || 0) - (left.rewardAmount || 0);
          case "recently_updated":
            return (
              new Date(right.updatedAt).getTime() -
              new Date(left.updatedAt).getTime()
            );
          case "newest":
          default:
            return (
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime()
            );
        }
      });
  }, [
    allBounties,
    rewardRange,
    searchQuery,
    selectedOrganizations,
    selectedTypes,
    sortOption,
    statusFilter,
  ]);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((previous) =>
      previous.includes(type)
        ? previous.filter((value) => value !== type)
        : [...previous, type],
    );
  }, []);

  const toggleOrganization = useCallback((organization: string) => {
    setSelectedOrganizations((previous) =>
      previous.includes(organization)
        ? previous.filter((value) => value !== organization)
        : [...previous, organization],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedOrganizations([]);
    setRewardRange(DEFAULT_REWARD_RANGE);
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setSortOption(DEFAULT_SORT_OPTION);
  }, []);

  return (
    <div className="min-h-screen text-foreground pb-20 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-125 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="mb-10 text-center lg:text-left border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Explore <span className="text-primary">Bounties</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed">
            Discover and contribute to open source projects. Fix bugs, build
            features, and earn rewards in crypto.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-70 shrink-0 space-y-8">
            <div className="lg:sticky lg:top-24 space-y-6">
              <FiltersSidebar
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedTypes={selectedTypes}
                onToggleType={toggleType}
                selectedOrganizations={selectedOrganizations}
                organizations={organizations}
                onToggleOrganization={toggleOrganization}
                rewardRange={rewardRange}
                onRewardRangeChange={setRewardRange}
                defaultRewardRange={DEFAULT_REWARD_RANGE}
                statusFilter={statusFilter}
                defaultStatusFilter={DEFAULT_STATUS_FILTER}
                onStatusFilterChange={setStatusFilter}
                bountyTypes={BOUNTY_TYPES}
                statuses={STATUSES}
                onClearFilters={clearFilters}
              />

              <div className="hidden lg:block">
                <MiniLeaderboard className="w-full" />
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <SearchHeader
              resultsCount={filteredBounties.length}
              sortOption={sortOption}
              onSortOptionChange={setSortOption}
            />

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
            ) : (
              <BountyGrid
                bounties={filteredBounties}
                onClearFilters={clearFilters}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
