"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchHeaderProps {
  resultsCount: number;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
}

export function SearchHeader({
  resultsCount,
  sortOption,
  onSortOptionChange,
}: SearchHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-sm">
      <div className="text-sm">
        <span className="font-semibold">{resultsCount}</span> results found
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm hidden sm:inline font-medium">Sort by:</span>
        <Select value={sortOption} onValueChange={onSortOptionChange}>
          <SelectTrigger className="w-44 focus:border-primary/50 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="highest_reward">Highest Reward</SelectItem>
            <SelectItem value="recently_updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
