"use client";

import Link from "next/link";
import { Zap, CalendarDays, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLightningRounds, type LightningRound } from "@/hooks/use-lightning-rounds";
import { format, isPast, isFuture } from "date-fns";

function RoundStatusBadge({ round }: { round: LightningRound }) {
  const status = round.status.toLowerCase();
  if (status === "active") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </Badge>
    );
  }
  if (round.endDate && isPast(new Date(round.endDate))) {
    return (
      <Badge variant="outline" className="text-muted-foreground text-[10px]">
        Ended
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">
      Upcoming
    </Badge>
  );
}

function RoundRow({ round }: { round: LightningRound }) {
  const isEnded = round.endDate ? isPast(new Date(round.endDate)) : false;
  const isUpcoming = round.startDate ? isFuture(new Date(round.startDate)) : false;

  return (
    <Link
      href={`/bounty/lightning-round?windowId=${round.id}`}
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 border-b border-border/40 last:border-0",
        "hover:bg-muted/40 transition-colors group"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          isEnded
            ? "bg-muted"
            : "bg-yellow-500/15 border border-yellow-500/30"
        )}
      >
        {isEnded ? (
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Zap
            className={cn(
              "h-4 w-4",
              isUpcoming ? "text-blue-400" : "text-yellow-400 fill-yellow-400"
            )}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isEnded ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {round.name}
          </span>
          <RoundStatusBadge round={round} />
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {round.startDate
              ? format(new Date(round.startDate), "MMM d, yyyy")
              : "TBD"}
          </span>
          <span>{round.bountyCount} bounties</span>
          <span>${round.totalValue.toLocaleString()}</span>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface LightningRoundScheduleProps {
  className?: string;
  maxItems?: number;
}

export function LightningRoundSchedule({
  className,
  maxItems = 3,
}: LightningRoundScheduleProps) {
  const { rounds, isLoading } = useLightningRounds();

  const displayed = rounds.slice(0, maxItems);

  return (
    <Card
      className={cn(
        "border-border/50 bg-background-card overflow-hidden",
        className
      )}
    >
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-500" />
          Round Schedule
        </CardTitle>
        <Link
          href="/bounty/lightning-round"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <ScheduleSkeleton />
        ) : displayed.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No upcoming rounds scheduled.
          </div>
        ) : (
          <div className="flex flex-col">
            {displayed.map((round) => (
              <RoundRow key={round.id} round={round} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
