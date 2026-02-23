"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useBounties } from "@/hooks/use-bounties";
import { BountyCard } from "@/components/bounty/bounty-card";
import { BountyListSkeleton } from "@/components/bounty/bounty-card-skeleton";
import { BountyError } from "@/components/bounty/bounty-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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

export default function BountiesPage() {
  const { data, isLoading, isError, error, refetch } = useBounties();
  const allBounties = useMemo(() => data?.data ?? [], [data?.data]);

  const organizations = useMemo(
    () =>
      Array.from(
        new Set(allBounties.map((b) => b.organization?.name).filter(Boolean)),
      ).sort() as string[],
    [allBounties],
  );

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [rewardRange, setRewardRange] = useState<[number, number]>([0, 5000]);
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const [sortOption, setSortOption] = useState<string>("newest");

  // Constants for filters — aligned with backend enums
  const BOUNTY_TYPES = [
    { value: "FIXED_PRICE", label: "Fixed Price" },
    { value: "MILESTONE_BASED", label: "Milestone Based" },
    { value: "COMPETITION", label: "Competition" },
  ];
  const STATUSES = [
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

  // Filter Logic
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
          statusFilter === "all" || bounty.status === statusFilter;

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

  // Handlers
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleOrg = useCallback((org: string) => {
    setSelectedOrgs((prev) =>
      prev.includes(org) ? prev.filter((o) => o !== org) : [...prev, org],
    );
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedOrgs([]);
    setRewardRange([0, 5000]);
    setStatusFilter("OPEN");
    setSortOption("newest");
  };

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
          <aside className="w-full lg:w-70 shrink-0 space-y-8">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider  flex items-center gap-2">
                    <Filter className="size-4" /> Filters
                  </h2>
                  {(searchQuery ||
                    selectedTypes.length > 0 ||
                    selectedOrgs.length > 0 ||
                    rewardRange[0] !== 0 ||
                    rewardRange[1] !== 5000 ||
                    statusFilter !== "OPEN") && (
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
                  {/* Search */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Search</Label>
                    <div className="relative group">
                      <Search className="absolute left-3 top-2.5 size-4  group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Keywords..."
                        className="pl-9 h-9 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-400">
                      Status
                    </Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
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

                  {/* Bounty Type */}
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
                                checked={selectedTypes.includes(type.value)}
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

                    {/* Organization */}
                    <AccordionItem
                      value="organization"
                      className="border-none mt-2"
                    >
                      <AccordionTrigger className="text-xs font-medium  hover:no-underline ">
                        ORGANIZATION
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2 max-h-40 overflow-y-auto slim-scrollbar pr-2 leading-none">
                          {organizations.map((org) => (
                            <div
                              key={org}
                              className="flex items-center space-x-2.5 group py-0.5"
                            >
                              <Checkbox
                                id={`org-${org}`}
                                checked={selectedOrgs.includes(org)}
                                onCheckedChange={() => toggleOrg(org)}
                                className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <Label
                                htmlFor={`org-${org}`}
                                className="text-sm font-normal cursor-pointer transition-colors truncate"
                                title={org}
                              >
                                {org}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Reward Range */}
                    <AccordionItem value="reward" className="border-none mt-2">
                      <AccordionTrigger className="text-xs font-medium  hover:no-underline ">
                        REWARD RANGE
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2 px-1">
                          <Slider
                            defaultValue={[0, 5000]}
                            max={5000}
                            step={100}
                            value={[rewardRange[0], rewardRange[1]]}
                            onValueChange={(val) =>
                              setRewardRange([val[0], val[1] ?? 5000])
                            }
                            className="my-4"
                          />
                          <div className="flex items-center justify-between text-[10px]  font-medium">
                            <span>${rewardRange[0]}</span>
                            <span>${rewardRange[1]}+</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              <div className="hidden lg:block">
                <MiniLeaderboard className="w-full" />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4   backdrop-blur-sm">
              <div className="text-sm ">
                <span className="font-semibold ">
                  {filteredBounties.length}
                </span>{" "}
                results found
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm hidden sm:inline font-medium">
                  Sort by:
                </span>
                <Select value={sortOption} onValueChange={setSortOption}>
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
            ) : filteredBounties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                {filteredBounties.map((bounty) => (
                  <Link
                    key={bounty.id}
                    href={`/bounty/${bounty.id}`}
                    className="h-full block"
                  >
                    <BountyCard bounty={bounty} />
                  </Link>
                ))}
              </div>
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
