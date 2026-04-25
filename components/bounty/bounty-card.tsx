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
import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { BountyFieldsFragment } from "@/lib/graphql/generated";
import { EscrowStatus } from "./escrow-status";
import { useEscrowPool } from "@/hooks/use-escrow";
import { getRoundPhase } from "@/hooks/use-lightning-rounds";
import { BookmarkButton } from "./bookmark-button";

interface BountyCardProps {
  bounty: BountyFieldsFragment;
  onClick?: () => void;
  variant?: "grid" | "list";
}

const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "outline" | "destructive";
    label: string;
    dotColor: string;
  }
> = {
  open: {
    variant: "default",
    label: "Open",
    dotColor: "bg-emerald-500",
  },
  in_progress: {
    variant: "secondary",
    label: "In Progress",
    dotColor: "bg-blue-500",
  },
  completed: {
    variant: "outline",
    label: "Completed",
    dotColor: "bg-slate-400",
  },
  cancelled: {
    variant: "destructive",
    label: "Cancelled",
    dotColor: "bg-red-500",
  },
  draft: {
    variant: "outline",
    label: "Draft",
    dotColor: "bg-gray-400",
  },
  submitted: {
    variant: "secondary",
    label: "Submitted",
    dotColor: "bg-yellow-500",
  },
  under_review: {
    variant: "secondary",
    label: "Under Review",
    dotColor: "bg-amber-500",
  },
  in_review: {
    variant: "secondary",
    label: "In Review",
    dotColor: "bg-amber-500",
  },
  disputed: {
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
  const normalizedStatus = bounty.status
    .toUpperCase()
    .replace(/-/g, "_") as string;
  const status =
    statusConfig[normalizedStatus.toLowerCase()] ?? statusConfig.open;
  const isFcfsClaimed =
    bounty.type === "FIXED_PRICE" && normalizedStatus === "IN_PROGRESS";
  const timeLeft = bounty.updatedAt
    ? formatDistanceToNow(new Date(bounty.updatedAt), { addSuffix: true })
    : "N/A";

  const orgName = bounty.organization?.name ?? "Unknown";
  const orgLogo = bounty.organization?.logo;

  // Fetch escrow pool data
  const { data: pool } = useEscrowPool(bounty.id);

  // ── Lightning Round detection ──────────────────────────────────────────────
  // A bounty belongs to an active Lightning Round when it has a bountyWindow
  // whose phase is currently "active". We derive this client-side from the
  // dates already present in the BountyFieldsFragment — no extra fetch needed.
  const isLightningRound =
    !!bounty.bountyWindow &&
    getRoundPhase({
      startDate: bounty.bountyWindow.startDate ?? null,
      endDate: bounty.bountyWindow.endDate ?? null,
      status: bounty.bountyWindow.status,
    }) === "active";

  return (
    <Card
      className={cn(
        "overflow-hidden w-full max-w-sm h-full rounded-lg cursor-pointer transition-all duration-300",
        "flex flex-col relative", // Add relative for bookmark button positioning
        "p-0",
        variant === "list" && "md:flex-row",
        // Subtle ring highlight for Lightning Round bounties
        isLightningRound &&
          "ring-1 ring-yellow-500/40 shadow-[0_0_12px_0_rgba(234,179,8,0.12)]",
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
      {/* Lightning Round top bar */}
      {isLightningRound && (
        <div className="flex items-center gap-1.5 bg-yellow-500/15 border-b border-yellow-500/20 px-4 py-1.5">
          <Zap className="size-3 text-yellow-400 shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-400">
            Lightning Round
          </span>
          {bounty.bountyWindow?.name && (
            <span className="text-[10px] text-yellow-500/60 truncate">
              · {bounty.bountyWindow.name}
            </span>
          )}
        </div>
      )}

      {/* Bookmark button - top-right corner */}
      <div
        className="absolute right-2 top-2 z-10"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
          }
        }}
      >
        <BookmarkButton bountyId={bounty.id} size="sm" />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", status.dotColor)} />
              <Badge variant={status.variant} className="text-xs font-medium">
                {isFcfsClaimed ? "Claimed" : status.label}
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

          {pool ? (
            <div className="mb-4">
              <EscrowStatus
                status={pool.status}
                lockedAmount={
                  pool.status === "Fully Released"
                    ? 0
                    : pool.totalAmount - pool.releasedAmount
                }
                releasedAmount={pool.releasedAmount}
                currency={pool.asset}
                showAmounts={true}
              />
            </div>
          ) : null}

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
