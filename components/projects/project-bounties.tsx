"use client";

import { useState } from "react";
import { BountyList } from "@/components/bounty/bounty-list";
import { Badge } from "@/components/ui/badge";
import type { BountyType, BountyStatus } from "@/types/bounty";
import { cn } from "@/lib/utils";

interface ProjectBountiesProps {
  projectId: string;
}

const bountyTypes: { value: BountyType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "FIXED_PRICE", label: "Fixed Price" },
  { value: "MILESTONE_BASED", label: "Milestone" },
  { value: "COMPETITION", label: "Competition" },
];

const statuses: { value: BountyStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "DISPUTED", label: "Disputed" },
];

export function ProjectBounties({ projectId }: ProjectBountiesProps) {
  const [selectedType, setSelectedType] = useState<BountyType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<BountyStatus | "all">(
    "all",
  );

  // Get all bounties for this project

  const params = {
    projectId,
    ...(selectedType !== "all" && { type: selectedType }),
    ...(selectedStatus !== "all" && { status: selectedStatus }),
  };

  const hasFilters = selectedType !== "all" || selectedStatus !== "all";

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedStatus("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Available Bounties</h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline self-start sm:self-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <div className="flex flex-wrap gap-2">
            {bountyTypes.map((type) => (
              <Badge
                key={type.value}
                asChild
                variant="outline"
                className={cn(
                  "cursor-pointer transition-all",
                  selectedType === type.value &&
                    "bg-primary text-primary-foreground border-primary",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  aria-pressed={selectedType === type.value}
                >
                  {type.label}
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Badge
                key={status.value}
                asChild
                variant="outline"
                className={cn(
                  "cursor-pointer transition-all",
                  selectedStatus === status.value &&
                    "bg-primary text-primary-foreground border-primary",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelectedStatus(status.value)}
                  aria-pressed={selectedStatus === status.value}
                >
                  {status.label}
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Bounties List */}
      <BountyList
        params={params}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
