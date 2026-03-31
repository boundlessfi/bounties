"use client";

import Link from "next/link";
import { Zap, ArrowRight, Clock, DollarSign, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLightningRounds, useCountdown } from "@/hooks/use-lightning-rounds";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-mono font-bold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-widest mt-1 opacity-70">
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <span className="text-2xl md:text-3xl font-bold opacity-40 pb-3 select-none">:</span>
  );
}

export function LightningRoundBanner({ className }: { className?: string }) {
  const { activeRound, isLoading } = useLightningRounds();

  const isActive =
    activeRound?.status.toLowerCase() === "active";
  const targetDate = isActive ? activeRound?.endDate : activeRound?.startDate;
  const countdown = useCountdown(targetDate ?? null);

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full rounded-2xl border border-yellow-500/20 bg-yellow-500/5 animate-pulse h-40",
          className
        )}
      />
    );
  }

  if (!activeRound) return null;

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border border-yellow-500/30",
        "bg-gradient-to-br from-yellow-950/40 via-background to-amber-950/20",
        className
      )}
    >
      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Left: Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30">
              <Zap className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
                Lightning Round
              </span>
            </div>
            {isActive ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Live
              </Badge>
            ) : (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                Upcoming
              </Badge>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 truncate">
            {activeRound.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {isActive
              ? "A curated burst of high-value bounties — claim your spot before time runs out."
              : "The next Lightning Round is almost here. Get ready to compete."}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4 text-yellow-500/70" />
              <span>
                <span className="font-semibold text-foreground">
                  {activeRound.bountyCount}
                </span>{" "}
                bounties
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-yellow-500/70" />
              <span>
                <span className="font-semibold text-foreground">
                  ${activeRound.totalValue.toLocaleString()}
                </span>{" "}
                total value
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4 text-yellow-500/70" />
              <span>
                {isActive ? "Ends" : "Starts"}{" "}
                {targetDate
                  ? new Date(targetDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "TBD"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Countdown + CTA */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          {!countdown.expired && (
            <div className="flex items-center gap-1.5 text-yellow-300">
              <CountdownUnit value={countdown.days} label="days" />
              <CountdownSeparator />
              <CountdownUnit value={countdown.hours} label="hrs" />
              <CountdownSeparator />
              <CountdownUnit value={countdown.minutes} label="min" />
              <CountdownSeparator />
              <CountdownUnit value={countdown.seconds} label="sec" />
            </div>
          )}

          <Button
            asChild
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-1.5 w-full"
          >
            <Link href="/bounty/lightning-round">
              <Zap className="h-4 w-4 fill-black" />
              View All Lightning Bounties
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
