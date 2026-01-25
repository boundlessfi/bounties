"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Bounty {
  id: string;
  title: string;
  description: string;
  budget: {
    amount: number;
    asset: string;
  };
  status:
    | "open"
    | "claimed"
    | "in_progress"
    | "under_review"
    | "completed"
    | "disputed";
  category: string;
  claimingModel: 1 | 2 | 3 | 4;
  creator: {
    wallet: string;
    displayName?: string;
    avatar?: string;
  };
  deadline: Date;
  applicantCount?: number;
  milestoneCount?: number;
}

interface BountyCardProps {
  bounty: Bounty;
  onClick?: () => void;
  variant?: "grid" | "list";
}

const statusConfig = {
  open: {
    variant: "default" as const,
    label: "Open",
    dotColor: "bg-emerald-500",
  },
  claimed: {
    variant: "secondary" as const,
    label: "Claimed",
    dotColor: "bg-amber-500",
  },
  in_progress: {
    variant: "secondary" as const,
    label: "In Progress",
    dotColor: "bg-blue-500",
  },
  under_review: {
    variant: "secondary" as const,
    label: "Under Review",
    dotColor: "bg-amber-500",
  },
  completed: {
    variant: "outline" as const,
    label: "Completed",
    dotColor: "bg-slate-400",
  },
  disputed: {
    variant: "destructive" as const,
    label: "Disputed",
    dotColor: "bg-red-500",
  },
};

const modelNames = {
  1: "Single Claim",
  2: "Application",
  3: "Competition",
  4: "Multi-Winner",
};

export function BountyCard({
  bounty,
  onClick,
  variant = "grid",
}: BountyCardProps) {
  const status = statusConfig[bounty.status];
  const timeLeft = formatDistanceToNow(bounty.deadline, { addSuffix: true });

  return (
    <Card
      className={cn(
        "overflow-hidden w-full max-w-xs  rounded-4xl cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:border-primary/60 hover:scale-[1.02]",
        "border border-slate-200 dark:border-slate-800",
        variant === "list" && "flex flex-col",
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Main Content Section */}

      <div
        className={cn(
          "flex-1 flex flex-col",
          variant === "list" && "md:flex-row md:items-center",
        )}
      >
        <CardHeader
          className={cn(
            "pb-3 px-4 sm:px-5",
            variant === "list" && "md:flex-1 md:pb-0",
          )}
        >
          {/* Header Row with Status and Budget */}

          <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full animate-pulse",
                  status.dotColor,
                )}
              />
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            </div>

            {variant === "grid" && (
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {bounty.budget.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  {bounty.budget.asset}
                </div>
              </div>
            )}
          </div>

          {/* Title and Description */}

          <CardTitle className="text-base font-semibold line-clamp-2 text-slate-900 dark:text-slate-50 mb-1">
            {bounty.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
            {bounty.description}
          </CardDescription>

          {/* Category and Model Badges */}

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              variant="outline"
              className="text-xs px-3 py-1 bg-[#f7fff0] dark:bg-slate-900 border-[#f2ffe5] dark:border-slate-700"
            >
              {bounty.category}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs px-3 py-1 bg-[#f7fff0] dark:bg-slate-900 border-[#f2ffe5] dark:border-slate-700"
            >
              {modelNames[bounty.claimingModel]}
            </Badge>
            {bounty.milestoneCount != null && (
              <Badge
                variant="outline"
                className="text-xs px-3 py-1 bg-[#f7fff0] dark:bg-slate-900 border-[#f2ffe5] dark:border-slate-700"
              >
                {bounty.milestoneCount}{" "}
                {bounty.milestoneCount === 1 ? "milestone" : "milestones"}
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* List Variant Budget Display */}

        {variant === "list" && (
          <div className="px-4 sm:px-6 py-3 md:w-48 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {bounty.budget.amount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {bounty.budget.asset}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Creator and Meta Info */}

      <CardFooter className="border-t border-[#f0f0f0] dark:border-slate-700 flex flex-wrap sm:items-center justify-center md:justify-between gap-3 py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
        {/* Creator Info */}
        <div className="flex items-center gap-2 min-w-0 order-1 sm:order-none">
          <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-700 flex-shrink-0">
            <AvatarImage src={bounty.creator.avatar} />
            <AvatarFallback className="text-xs font-medium">
              {bounty.creator.displayName?.[0]?.toUpperCase() ||
                bounty.creator.wallet.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
            {bounty.creator.displayName ||
              `${bounty.creator.wallet.slice(0, 8)}...`}
          </span>
        </div>

        {/* Meta Information */}

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 order-2 sm:order-none">
          {bounty.deadline && (
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{timeLeft}</span>
              <span className="sm:hidden">
                {timeLeft.replace(" ago", "").replace(" from now", "")}
              </span>
            </div>
          )}
          {bounty.applicantCount != null && (
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{bounty.applicantCount}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
