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
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Bounty, BountyStatus } from "@/types/bounty";

interface BountyCardProps {
  bounty: Bounty;
  onClick?: () => void;
  variant?: "grid" | "list";
}

const statusConfig: Record<
  BountyStatus,
  {
    variant: "default" | "secondary" | "outline" | "destructive";
    label: string;
    dotColor: string;
  }
> = {
  OPEN: {
    variant: "default",
    label: "Open",
    dotColor: "bg-emerald-500",
  },
  IN_PROGRESS: {
    variant: "secondary",
    label: "In Progress",
    dotColor: "bg-blue-500",
  },
  COMPLETED: {
    variant: "outline",
    label: "Completed",
    dotColor: "bg-slate-400",
  },
  CANCELLED: {
    variant: "destructive",
    label: "Cancelled",
    dotColor: "bg-red-500",
  },
  DRAFT: {
    variant: "outline",
    label: "Draft",
    dotColor: "bg-gray-400",
  },
  SUBMITTED: {
    variant: "secondary",
    label: "Submitted",
    dotColor: "bg-yellow-500",
  },
  UNDER_REVIEW: {
    variant: "secondary",
    label: "Under Review",
    dotColor: "bg-amber-500",
  },
  DISPUTED: {
    variant: "destructive",
    label: "Disputed",
    dotColor: "bg-red-600",
  },
};

export function BountyCard({
  bounty,
  onClick,
  variant = "grid",
}: BountyCardProps) {
  const status = statusConfig[bounty.status] || statusConfig.COMPLETED;
  const timeLeft = bounty.updatedAt
    ? formatDistanceToNow(new Date(bounty.updatedAt), { addSuffix: true })
    : "N/A";

  const orgName = bounty.organization?.name ?? "Unknown";
  const orgLogo = bounty.organization?.logo;

  return (
    <Card
      className={cn(
        "overflow-hidden w-full max-w-sm h-full rounded-lg cursor-pointer transition-all duration-300",
        "flex flex-col",
        "p-0",
        variant === "list" && "md:flex-row",
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
      <div className="flex-1 flex flex-col justify-between">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", status.dotColor)} />
              <Badge variant={status.variant} className="text-xs font-medium">
                {status.label}
              </Badge>
            </div>

            {variant === "grid" && bounty.rewardAmount && (
              <div className="text-right">
                <div className="text-xl font-bold ">
                  ${bounty.rewardAmount.toLocaleString()}
                </div>
                <div className="text-[11px] font-medium">
                  {bounty.rewardCurrency}
                </div>
              </div>
            )}
          </div>

          <CardTitle className="text-base font-semibold line-clamp-2 mb-2 leading-snug">
            {bounty.title}
          </CardTitle>

          <CardDescription className="line-clamp-2 text-sm mb-4">
            {bounty.description}
          </CardDescription>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs px-2.5 py-1 ">
              {bounty.type.replace(/_/g, " ")}
            </Badge>
          </div>
        </CardHeader>

        {variant === "list" && bounty.rewardAmount && (
          <div className="px-5 py-3 md:w-48 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l">
            <div className="text-2xl font-bold ">
              ${bounty.rewardAmount.toLocaleString()}
            </div>
            <div className="text-xs font-medium">{bounty.rewardCurrency}</div>
          </div>
        )}
      </div>

      <CardFooter className="border-t flex items-center justify-between gap-3 py-3 px-5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {orgLogo && (
            <Avatar className="h-5 w-5 border shrink-0">
              <AvatarImage src={orgLogo || "/placeholder.svg"} />
              <AvatarFallback className="text-[10px] font-medium">
                {orgName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="truncate text-xs font-medium">{orgName}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs whitespace-nowrap">
            {timeLeft.replace(" ago", "").replace(" from now", "")}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
