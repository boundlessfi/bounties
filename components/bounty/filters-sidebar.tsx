"use client";

import { Filter, Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

export interface FilterOption {
  value: string;
  label: string;
}

interface FiltersSidebarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  selectedOrganizations: string[];
  organizations: string[];
  onToggleOrganization: (organization: string) => void;
  rewardRange: [number, number];
  onRewardRangeChange: (value: [number, number]) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  bountyTypes: FilterOption[];
  statuses: FilterOption[];
  onClearFilters: () => void;
}

export function FiltersSidebar({
  searchQuery,
  onSearchQueryChange,
  selectedTypes,
  onToggleType,
  selectedOrganizations,
  organizations,
  onToggleOrganization,
  rewardRange,
  onRewardRangeChange,
  statusFilter,
  onStatusFilterChange,
  bountyTypes,
  statuses,
  onClearFilters,
}: FiltersSidebarProps) {
  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedTypes.length > 0 ||
    selectedOrganizations.length > 0 ||
    rewardRange[0] !== 0 ||
    rewardRange[1] !== 5000 ||
    statusFilter !== "open";

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Filter className="size-4" /> Filters
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
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
            <Search className="absolute left-3 top-2.5 size-4 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Keywords..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-400">Status</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full border-gray-700 hover:border-gray-600 focus:border-primary/50 h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-background border-px border-primary/30">
              {statuses.map((status) => (
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
            <AccordionTrigger className="text-xs font-medium hover:no-underline">
              BOUNTY TYPE
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {bountyTypes.map((type) => (
                  <div
                    key={type.value}
                    className="flex items-center space-x-2.5 group"
                  >
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => onToggleType(type.value)}
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

          <AccordionItem value="organization" className="border-none mt-2">
            <AccordionTrigger className="text-xs font-medium hover:no-underline">
              ORGANIZATION
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2 max-h-40 overflow-y-auto slim-scrollbar pr-2 leading-none">
                {organizations.map((organization) => (
                  <div
                    key={organization}
                    className="flex items-center space-x-2.5 group py-0.5"
                  >
                    <Checkbox
                      id={`org-${organization}`}
                      checked={selectedOrganizations.includes(organization)}
                      onCheckedChange={() => onToggleOrganization(organization)}
                      className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`org-${organization}`}
                      className="text-sm font-normal cursor-pointer transition-colors truncate"
                      title={organization}
                    >
                      {organization}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reward" className="border-none mt-2">
            <AccordionTrigger className="text-xs font-medium hover:no-underline">
              REWARD RANGE
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-1">
                <Slider
                  defaultValue={[0, 5000]}
                  max={5000}
                  step={100}
                  value={[rewardRange[0], rewardRange[1]]}
                  onValueChange={(value) =>
                    onRewardRangeChange([value[0], value[1] ?? 5000])
                  }
                  className="my-4"
                />
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span>${rewardRange[0]}</span>
                  <span>${rewardRange[1]}+</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
