"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterPanel } from "@/components/filters/filter-panel";
import { ProjectCard } from "@/components/cards/project-card";
import { BountyCard } from "@/components/cards/bounty-card";
import { Skeleton } from "@/components/ui/skeleton";
import { mockProjects, mockBounties as rawMockBounties } from "@/lib/mock-data";
import { FilterState, TabType } from "@/lib/types";
import { PackageOpen, Coins } from "lucide-react";
import { BountyLogic } from "@/lib/logic/bounty-logic";

// Validation helpers
const isValidTab = (value: string | null): value is TabType => {
  return value === "projects" || value === "bounties";
};

const isValidSort = (value: string | null): value is FilterState["sort"] => {
  return (
    value === "newest" ||
    value === "recentlyUpdated" ||
    value === "highestReward"
  );
};

// EmptyState component
const EmptyState = ({ type }: { type: "projects" | "bounties" }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="mb-4 p-6 bg-primary/5 rounded-full">
      {type === "projects" ? (
        <PackageOpen className="h-16 w-16 text-primary/50" />
      ) : (
        <Coins className="h-16 w-16 text-primary/50" />
      )}
    </div>
    <h3 className="text-xl font-semibold mb-2">No {type} found</h3>
    <p className="text-muted-foreground max-w-md">
      Try adjusting your filters or search terms to find what you&#39;re looking
      for.
    </p>
  </div>
);

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params with validation
  const initialTabParam = searchParams.get("tab");
  const initialSortParam = searchParams.get("sort");

  const [activeTab, setActiveTab] = useState<TabType>(
    isValidTab(initialTabParam) ? initialTabParam : "projects",
  );
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
    sort: isValidSort(initialSortParam) ? initialSortParam : "newest",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab change and reset invalid sort options
  const handleTabChange = (value: string) => {
    const newTab = value as TabType;
    setActiveTab(newTab);

    // Reset sort to "newest" if switching to projects tab with "highestReward" sort
    if (newTab === "projects" && filters.sort === "highestReward") {
      setFilters((prev) => ({ ...prev, sort: "newest" }));
    }
  };

  // Update URL when state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      if (filters.search) params.set("search", filters.search);
      if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
      if (filters.sort !== "newest") params.set("sort", filters.sort);

      router.replace(`/discover?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, filters, router]);

  // Filter and sort projects
  const filteredProjects = useCallback(() => {
    let result = [...mockProjects];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      result = result.filter((p) =>
        filters.tags.some((tag) => p.tags.includes(tag)),
      );
    }

    // Apply sort (only valid sorts for projects)
    switch (filters.sort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "recentlyUpdated":
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
      default:
        // Fallback to newest for unsupported sort values (e.g. "highestReward")
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return result;
  }, [filters]);

  // Filter and sort bounties
  const filteredBounties = useCallback(() => {
    // Process bounties for dynamic status (e.g. expiration)
    let result = rawMockBounties.map((b) => BountyLogic.processBountyStatus(b));

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.description.toLowerCase().includes(searchLower),
      );
    }

    // Apply sort
    switch (filters.sort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "recentlyUpdated":
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
      case "highestReward":
        result.sort((a, b) => b.rewardAmount - a.rewardAmount);
        break;
    }

    return result;
  }, [filters]);

  const projects = filteredProjects();
  const bounties = filteredBounties();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border/50 bg-linear-to-b from-background to-background-card">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-3">
              Discover Projects & Bounties
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore innovative projects shaping the future on Stellar. Find
              bounties that match your skills and earn rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Tab Navigation */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <TabsList className="bg-background-card text-gray-100 border border-border/50 p-1">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-gray-100"
              >
                <PackageOpen className="mr-2 h-4 w-4" />
                Projects
                <span className="ml-2 text-xs opacity-70">
                  ({mockProjects.length})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="bounties"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-gray-100"
              >
                <Coins className="mr-2 h-4 w-4" />
                Bounties
                <span className="ml-2 text-xs opacity-70">
                  ({rawMockBounties.length})
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filter Panel */}
          <div className="mb-8">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              activeTab={activeTab}
            />
          </div>

          {/* Projects Tab Content */}
          <TabsContent value="projects" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState type="projects" />
            )}
          </TabsContent>

          {/* Bounties Tab Content */}
          <TabsContent value="bounties" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ))}
              </div>
            ) : bounties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bounties.map((bounty) => (
                  <BountyCard key={bounty.id} bounty={bounty} />
                ))}
              </div>
            ) : (
              <EmptyState type="bounties" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
