"use client";

import { useMemo } from "react";
import { useBounties } from "@/hooks/use-bounties";
import {
  useBountyFilters,
  BOUNTY_TYPES,
  STATUSES,
} from "@/hooks/use-bounty-filters";
import { FiltersSidebar } from "@/components/bounty/filters-sidebar";
import { BountyToolbar } from "@/components/bounty/bounty-toolbar";
import { BountyGrid } from "@/components/bounty/bounty-grid";
import { LightningRoundBanner } from "@/components/bounty/lightning-round-banner";

export default function BountiesPage() {
  const { data, isLoading, isError, error, refetch } = useBounties();
  const allBounties = useMemo(() => data?.data ?? [], [data?.data]);

  const filters = useBountyFilters(allBounties);

  return (
    <div className="min-h-screen  text-foreground pb-20 relative overflow-hidden">
      {/* Background ambient glow */}
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
          <FiltersSidebar
            searchQuery={filters.searchQuery}
            onSearchChange={filters.setSearchQuery}
            selectedTypes={filters.selectedTypes}
            onToggleType={filters.toggleType}
            bountyTypes={BOUNTY_TYPES}
            selectedOrgs={filters.selectedOrgs}
            onToggleOrg={filters.toggleOrg}
            organizations={filters.organizations}
            rewardRange={filters.rewardRange}
            onRewardRangeChange={filters.setRewardRange}
            statusFilter={filters.statusFilter}
            onStatusChange={filters.setStatusFilter}
            statuses={STATUSES}
            hasActiveFilters={filters.hasActiveFilters}
            onClearFilters={filters.clearFilters}
          />

          <main className="flex-1 min-w-0">
            <LightningRoundBanner className="mb-8" />
            <BountyToolbar
              totalCount={filters.filteredBounties.length}
              sortOption={filters.sortOption}
              onSortChange={filters.setSortOption}
            />
            <BountyGrid
              bounties={filters.filteredBounties}
              isLoading={isLoading}
              isError={isError}
              errorMessage={
                error instanceof Error
                  ? error.message
                  : "Failed to load bounties"
              }
              onRetry={refetch}
              onClearFilters={filters.clearFilters}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
