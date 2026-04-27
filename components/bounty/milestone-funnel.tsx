"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import type { Milestone, ContributorProgress } from "@/types/bounty";

interface MilestoneFunnelProps {
  milestones: Milestone[];
  contributors: ContributorProgress[];
  className?: string;
}

export function MilestoneFunnel({
  milestones,
  contributors,
  className,
}: MilestoneFunnelProps) {
  if (!milestones.length) return null;

  return (
    <div className={cn("w-full py-8 px-4", className)}>
      <div className="relative flex justify-between items-start">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-800 z-0" />

        {milestones.map((milestone, index) => {
          const milestoneContributors = contributors.filter(
            (c) => c.currentMilestoneId === milestone.id,
          );
          const isLast = index === milestones.length - 1;

          return (
            <div
              key={milestone.id}
              className="relative flex flex-col items-center z-10 group"
              style={{ width: `${100 / milestones.length}%` }}
            >
              {/* Milestone Indicator */}
              <div
                className={cn(
                  "size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  milestone.isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_8px_rgba(167,249,80,0.2)]"
                    : "bg-background border-gray-700 text-gray-500 group-hover:border-primary/50",
                )}
              >
                {milestone.isCompleted ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <Circle className="size-6 fill-current opacity-20" />
                )}
              </div>

              {/* Milestone Title & Description */}
              <div className="mt-4 text-center px-2">
                <h4
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    milestone.isCompleted
                      ? "text-primary"
                      : "text-gray-400 group-hover:text-gray-200",
                  )}
                >
                  {milestone.title}
                </h4>
                {milestone.description && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                    {milestone.description}
                  </p>
                )}
              </div>

              {/* Contributor Avatars */}
              <div className="mt-6 flex -space-x-2 overflow-hidden justify-center min-h-[40px]">
                <TooltipProvider>
                  {milestoneContributors.length > 0 ? (
                    milestoneContributors.map((contributor) => (
                      <Tooltip key={contributor.userId}>
                        <TooltipTrigger asChild>
                          <div className="relative group/avatar">
                            <Avatar className="size-8 border-2 border-background ring-2 ring-transparent group-hover/avatar:ring-primary/50 transition-all cursor-pointer">
                              <AvatarImage
                                src={contributor.userAvatarUrl}
                                alt={contributor.userName}
                              />
                              <AvatarFallback>
                                {contributor.userName
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 rounded-full transition-opacity" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="bg-background-card border-primary/20 text-xs"
                        >
                          <p>{contributor.userName}</p>
                          <p className="text-[10px] text-muted-foreground italic">
                            Current Milestone
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))
                  ) : (
                    <div className="size-8 rounded-full border border-dashed border-gray-800 flex items-center justify-center opacity-30">
                      <span className="text-[8px] text-gray-600">None</span>
                    </div>
                  )}
                </TooltipProvider>
              </div>

              {/* Connective Line (Active State) */}
              {!isLast && milestone.isCompleted && (
                <div className="absolute top-5 left-[50%] w-full h-0.5 bg-gradient-to-r from-primary to-primary/50 z-[-1]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
