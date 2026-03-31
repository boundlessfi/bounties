"use client";

import { ContributionHistory } from "@/types/reputation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay } from "date-fns";

interface ContributionHeatmapProps {
  contributionHistory: ContributionHistory;
  className?: string;
}

interface DayData {
  date: string;
  count: number;
}

// Color levels for different contribution intensities
const getContributionColor = (count: number, maxCount: number): string => {
  if (count === 0) return "bg-muted";

  const ratio = count / (maxCount || 1);

  if (ratio >= 0.8) return "bg-primary";
  if (ratio >= 0.6) return "bg-primary/80";
  if (ratio >= 0.4) return "bg-primary/60";
  if (ratio >= 0.2) return "bg-primary/40";
  return "bg-primary/20";
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ContributionHeatmap({
  contributionHistory,
  className,
}: ContributionHeatmapProps) {
  const { contributions, totalContributions, streak } = contributionHistory;

  // Generate last 365 days (52 weeks + 1 day = 365 days)
  const today = startOfDay(new Date());
  const daysData: DayData[] = [];

  // Build a Map for O(1) lookup instead of O(n) .find() in each iteration
  const contributionMap = new Map(contributions.map((c) => [c.date, c.count]));

  for (let i = 364; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = contributionMap.get(dateStr) ?? 0;
    daysData.push({
      date: dateStr,
      count,
    });
  }

  // Organize into weeks for grid display
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  // Find the starting day of week (Sunday)
  const startDate = subDays(today, 364);
  const startDayOfWeek = startDate.getDay();

  // Add padding days for the first week
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push({ date: "", count: 0 });
  }

  daysData.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Push remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", count: 0 });
    }
    weeks.push(currentWeek);
  }

  const maxCount = Math.max(...daysData.map((d) => d.count), 1);

  // Handle empty data
  if (totalContributions === 0) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Contribution Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <p>No contributions in the last year</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Contribution Activity
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {streak.current}
              </span>{" "}
              day streak
            </span>
            <span>
              <span className="font-semibold text-foreground">
                {streak.longest}
              </span>{" "}
              best
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <TooltipProvider>
          <div className="flex flex-col gap-1">
            {/* Month labels */}
            <div className="flex gap-[3px] ml-6 mb-1">
              {weeks.map((week, weekIndex) => {
                // Find the first valid date in this week to determine the month
                const firstValidDay = week.find((day) => day.date);
                if (!firstValidDay) {
                  return <div key={weekIndex} className="w-3" />;
                }
                const weekMonth = format(new Date(firstValidDay.date), "MMM");
                const shouldShow =
                  weekIndex === 0 ||
                  weeks[weekIndex - 1]?.some(
                    (day) =>
                      day.date &&
                      format(new Date(day.date), "MMM") !== weekMonth,
                  );
                if (!shouldShow) {
                  return <div key={weekIndex} className="w-3" />;
                }
                return (
                  <div
                    key={weekIndex}
                    className="text-xs text-muted-foreground w-8"
                  >
                    {weekMonth}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1">
              {/* Weekday labels */}
              <div className="flex flex-col gap-[3px] pr-2">
                {WEEKDAYS.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "text-xs text-muted-foreground h-3 w-6 flex items-center justify-end",
                      index % 2 === 1 && "opacity-0",
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-[3px] overflow-x-auto">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => {
                      const colorClass = day.date
                        ? getContributionColor(day.count, maxCount)
                        : "bg-transparent";

                      return (
                        <Tooltip
                          key={`${weekIndex}-${dayIndex}`}
                          delayDuration={0}
                        >
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "h-3 w-3 rounded-sm transition-colors hover:ring-2 hover:ring-primary/50",
                                colorClass,
                              )}
                            />
                          </TooltipTrigger>
                          {day.date && (
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-medium">
                                {day.count} contribution
                                {day.count !== 1 ? "s" : ""}
                              </p>
                              <p className="text-muted-foreground">
                                {format(new Date(day.date), "MMM d, yyyy")}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="h-2 w-2 rounded-sm bg-muted" />
              <div className="h-2 w-2 rounded-sm bg-primary/20" />
              <div className="h-2 w-2 rounded-sm bg-primary/40" />
              <div className="h-2 w-2 rounded-sm bg-primary/60" />
              <div className="h-2 w-2 rounded-sm bg-primary/80" />
              <div className="h-2 w-2 rounded-sm bg-primary" />
              <span>More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
