"use client";

import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useLightningRounds,
  getRoundPhase,
  type LightningRound,
} from "@/hooks/use-lightning-rounds";

// ---------------------------------------------------------------------------
// RoundRow
// ---------------------------------------------------------------------------

function RoundRow({ round }: { round: LightningRound }) {
  const phase = getRoundPhase(round);

  const phaseConfig = {
    active: {
      badge: "Live",
      badgeCn: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      icon: <Zap className="size-3.5 text-yellow-400" />,
      dateLine: round.endDate
        ? `Ends ${formatDistanceToNow(new Date(round.endDate), { addSuffix: true })}`
        : "End date TBD",
    },
    upcoming: {
      badge: "Upcoming",
      badgeCn: "bg-primary/20 text-primary border-primary/30",
      icon: <Clock className="size-3.5 text-primary" />,
      dateLine: round.startDate
        ? `Starts ${format(new Date(round.startDate), "MMM d, yyyy")}`
        : "Date TBD",
    },
    ended: {
      badge: "Ended",
      badgeCn: "bg-muted/30 text-muted-foreground border-muted/30",
      icon: <CheckCircle2 className="size-3.5 text-muted-foreground" />,
      dateLine: round.endDate
        ? `Ended ${format(new Date(round.endDate), "MMM d, yyyy")}`
        : "Ended",
    },
  } as const;

  const cfg = phaseConfig[phase];

  return (
    <Link
      href={`/bounty/lightning-round?id=${round.id}`}
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors",
        phase === "active"
          ? "border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10"
          : phase === "upcoming"
            ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
            : "border-muted/20 hover:bg-muted/10",
      )}
    >
      {/* Icon + name */}
      <div className="flex items-center gap-2 min-w-0">
        {cfg.icon}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{round.name}</p>
          <p className="text-xs text-muted-foreground">{cfg.dateLine}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:block">
          {round.stats.totalBounties} bounties
        </span>
        <Badge
          variant="outline"
          className={cn("text-[10px] px-2 py-0.5 border", cfg.badgeCn)}
        >
          {cfg.badge}
        </Badge>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// LightningRoundSchedule
// ---------------------------------------------------------------------------

interface LightningRoundScheduleProps {
  className?: string;
  /** Max number of upcoming rounds to show */
  maxUpcoming?: number;
  /** Max number of past rounds to show */
  maxPast?: number;
}

export function LightningRoundSchedule({
  className,
  maxUpcoming = 3,
  maxPast = 2,
}: LightningRoundScheduleProps) {
  const { rounds, isLoading, isError } = useLightningRounds();

  const activeRounds = rounds.filter((r) => getRoundPhase(r) === "active");
  const upcomingRounds = rounds
    .filter((r) => getRoundPhase(r) === "upcoming")
    .slice(0, maxUpcoming);
  const endedRounds = rounds
    .filter((r) => getRoundPhase(r) === "ended")
    .slice(0, maxPast);

  const visibleRounds = [...activeRounds, ...upcomingRounds, ...endedRounds];

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="size-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider">
          Round Schedule
        </h2>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Unable to load schedule.
        </p>
      )}

      {!isLoading && !isError && visibleRounds.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-6">
          No Lightning Rounds scheduled yet.
        </p>
      )}

      {!isLoading && !isError && visibleRounds.length > 0 && (
        <div className="space-y-2">
          {visibleRounds.map((round) => (
            <RoundRow key={round.id} round={round} />
          ))}
        </div>
      )}
    </div>
  );
}
