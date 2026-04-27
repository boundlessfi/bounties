"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Zap, Trophy, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import {
  type LightningRound,
  getRoundPhase,
  getRoundCountdownTarget,
} from "@/hooks/use-lightning-rounds";

// ---------------------------------------------------------------------------
// CountdownUnit
// ---------------------------------------------------------------------------

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl md:text-3xl font-bold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-widest mt-1 opacity-70">
        {label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LightningRoundBanner
// ---------------------------------------------------------------------------

interface LightningRoundBannerProps {
  round: LightningRound;
  className?: string;
}

export function LightningRoundBanner({
  round,
  className,
}: LightningRoundBannerProps) {
  const phase = getRoundPhase(round);
  const isActive = phase === "active";

  /**
   * Memoize the target as a number so useCountdown's dep array stays stable.
   * getRoundCountdownTarget already returns a number | null — memoize it so
   * the value only changes when the round's dates actually change.
   */
  const targetMs = useMemo(
    () => getRoundCountdownTarget(round),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round.startDate, round.endDate, round.status],
  );
  const timeLeft = useCountdown(targetMs);

  const claimedOrCompleted =
    round.stats.claimedCount + round.stats.completedCount;
  const progressPct =
    round.stats.totalBounties > 0
      ? Math.min(
          100,
          Math.round((claimedOrCompleted / round.stats.totalBounties) * 100),
        )
      : 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        isActive
          ? "border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent"
          : "border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
        className,
      )}
    >
      {/* Decorative glow */}
      <div
        className={cn(
          "absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30",
          isActive ? "bg-yellow-500" : "bg-primary",
        )}
      />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left — identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full",
                  isActive
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-primary/20 text-primary border border-primary/30",
                )}
              >
                <Zap className="size-3" />
                {isActive ? "Live Now" : "Coming Soon"}
              </div>

              {isActive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Flame
                  className={cn(
                    "size-5 shrink-0",
                    isActive ? "text-yellow-400" : "text-primary",
                  )}
                />
                {round.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isActive
                  ? "A curated burst of bounties across all skill categories. Earn more, earn faster."
                  : "The next Lightning Round is loading. Get ready to move fast."}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Trophy className="size-4 text-yellow-500" />
                <span className="font-semibold">
                  {round.stats.totalBounties}
                </span>
                <span className="text-muted-foreground">bounties</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-green-400">
                  ${round.stats.primaryValue.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {round.stats.primaryCurrency} total
                </span>
              </div>
              {round.stats.categories.slice(0, 3).map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 border-muted-foreground/30"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right — countdown + CTA */}
          <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
            {timeLeft && targetMs && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground text-center md:text-right">
                  {isActive ? "Round ends in" : "Starts in"}
                </p>
                <div className="flex items-center gap-3">
                  <CountdownUnit value={timeLeft.days} label="Days" />
                  <span className="text-xl font-bold opacity-40 -mt-2">:</span>
                  <CountdownUnit value={timeLeft.hours} label="Hrs" />
                  <span className="text-xl font-bold opacity-40 -mt-2">:</span>
                  <CountdownUnit value={timeLeft.minutes} label="Min" />
                  <span className="text-xl font-bold opacity-40 -mt-2">:</span>
                  <CountdownUnit value={timeLeft.seconds} label="Sec" />
                </div>
              </div>
            )}

            <Button
              asChild
              className={cn(
                "gap-2 font-semibold",
                isActive ? "bg-yellow-500 hover:bg-yellow-400 text-black" : "",
              )}
              variant={isActive ? "default" : "outline"}
            >
              <Link href={`/bounty/lightning-round?id=${round.id}`}>
                {isActive ? "View All Lightning Bounties" : "Preview Round"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress bar — shown for active rounds with at least one bounty */}
        {isActive && round.stats.totalBounties > 0 && (
          <div className="mt-6 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              {/* Label consistent with RoundHeader: "claimed or completed" */}
              <span>
                {claimedOrCompleted} of {round.stats.totalBounties} claimed or
                completed
              </span>
              {/* Same Math.min guard as the width so the two values can't diverge */}
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-yellow-500 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
