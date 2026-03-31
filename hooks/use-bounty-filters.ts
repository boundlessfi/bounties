import { useState, useMemo, useCallback } from "react";
import { type BountyFieldsFragment } from "@/lib/graphql/generated";

export const BOUNTY_TYPES = [
  { value: "FIXED_PRICE", label: "Fixed Price" },
  { value: "MILESTONE_BASED", label: "Milestone Based" },
  { value: "COMPETITION", label: "Competition" },
];

export const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "disputed", label: "Disputed" },
  { value: "all", label: "All Statuses" },
];

export function useBountyFilters(allBounties: BountyFieldsFragment[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [rewardRange, setRewardRange] = useState<[number, number]>([0, 5000]);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [sortOption, setSortOption] = useState<string>("newest");

  const organizations = useMemo(
    () =>
      Array.from(
        new Set(allBounties.map((b) => b.organization?.name).filter(Boolean)),
      ).sort() as string[],
    [allBounties],
  );

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

        const matchesOrg =
          selectedOrgs.length === 0 ||
          (bounty.organization?.name &&
            selectedOrgs.includes(bounty.organization.name));

        const amount = bounty.rewardAmount || 0;
        const matchesReward =
          amount >= rewardRange[0] && amount <= rewardRange[1];

        const matchesStatus =
          statusFilter === "all" ||
          bounty.status === statusFilter.toUpperCase();

        return (
          matchesSearch &&
          matchesType &&
          matchesOrg &&
          matchesReward &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "highest_reward":
            return (b.rewardAmount || 0) - (a.rewardAmount || 0);
          case "recently_updated":
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          case "newest":
          default:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
      });
  }, [
    allBounties,
    searchQuery,
    selectedTypes,
    selectedOrgs,
    rewardRange,
    statusFilter,
    sortOption,
  ]);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const toggleOrg = useCallback((org: string) => {
    setSelectedOrgs((prev) =>
      prev.includes(org) ? prev.filter((o) => o !== org) : [...prev, org],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedOrgs([]);
    setRewardRange([0, 5000]);
    setStatusFilter("open");
    setSortOption("newest");
  }, []);

  // Fix: use lowercase "open" to match the default state value
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedTypes.length > 0 ||
    selectedOrgs.length > 0 ||
    rewardRange[0] !== 0 ||
    rewardRange[1] !== 5000 ||
    statusFilter !== "open";

  return {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    selectedOrgs,
    rewardRange,
    setRewardRange,
    statusFilter,
    setStatusFilter,
    sortOption,
    setSortOption,
    organizations,
    filteredBounties,
    toggleType,
    toggleOrg,
    clearFilters,
    hasActiveFilters,
  };
}
