"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Trophy,
  Users,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BountyCard } from "@/components/bounty/bounty-card";
import { LightningRoundSchedule } from "@/components/bounty/lightning-round-schedule";
import { MiniLeaderboard } from "@/components/leaderboard/mini-leaderboard";
import { useCountdown } from "@/hooks/use-countdown";
import {
  useLightningRoundBounties,
  useLightningRounds,
  getRoundPhase,
  type LightningRound,
} from "@/hooks/use-lightning-rounds";
import { cn } from "@/lib/utils";
import { type BountyFieldsFragment } from "@/lib/graphql/generated";

function Digit({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-3xl md:text-4xl font-bold tabular-nums">
        {String(v).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border border-muted/20 bg-muted/5">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function CategorySection({
  category,
  bounties,
}: {
  category: string;
  bounties: BountyFieldsFragment[];
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {category}
        </h3>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          {bounties.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {bounties.map((bounty) => (
          <Link
            key={bounty.id}
            href={`/bounty/${bounty.id}`}
            className="h-full block"
          >
            <BountyCard bounty={bounty} />
          </Link>
        ))}
      </div>
    </section>
  );
}

function RoundHeader({ round }: { round: LightningRound }) {
  const phase = getRoundPhase(round);
  const isActive = phase === "active";
  const isUpcoming = phase === "upcoming";

  // Stable ms timestamp so useCountdown's dep doesn't churn on every render
  const targetMs = useMemo(() => {
    if (isActive && round.endDate) return new Date(round.endDate).getTime();
    if (isUpcoming && round.startDate)
      return new Date(round.startDate).getTime();
    return null;
  }, [isActive, isUpcoming, round.endDate, round.startDate]);

  const time = useCountdown(targetMs);

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
        "relative overflow-hidden rounded-2xl border p-8 md:p-10 mb-10",
        isActive
          ? "border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent"
          : "border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
      )}
    >
      <div
        className={cn(
          "absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20",
          isActive ? "bg-yellow-500" : "bg-primary",
        )}
      />

      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border",
                isActive
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-primary/20 text-primary border-primary/30",
              )}
            >
              <Zap className="size-3" />
              {isActive
                ? "Lightning Round — Live"
                : isUpcoming
                  ? "Coming Soon"
                  : "Round Ended"}
            </div>
            {isActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Flame
              className={cn(
                "size-8 shrink-0",
                isActive ? "text-yellow-400" : "text-primary",
              )}
            />
            {round.name}
          </h1>

          <p className="text-muted-foreground max-w-xl">
            A curated burst of bounties across all skill categories. Move fast —
            Lightning Rounds reward speed and quality.
          </p>
        </div>

        {time && targetMs && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {isActive ? "Round ends in" : "Starts in"}
            </p>
            <div className="flex items-end gap-4">
              <Digit v={time.days} label="Days" />
              <span className="text-3xl font-bold opacity-30 mb-2">:</span>
              <Digit v={time.hours} label="Hours" />
              <span className="text-3xl font-bold opacity-30 mb-2">:</span>
              <Digit v={time.minutes} label="Min" />
              <span className="text-3xl font-bold opacity-30 mb-2">:</span>
              <Digit v={time.seconds} label="Sec" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Trophy className="size-3.5" />}
            label="Total Bounties"
            value={round.stats.totalBounties}
          />
          <StatCard
            icon={<span className="text-green-400 text-xs font-bold">$</span>}
            label={`Total Value (${round.stats.primaryCurrency})`}
            value={`$${round.stats.primaryValue.toLocaleString()}`}
          />
          <StatCard
            icon={<Users className="size-3.5" />}
            label="Claimed"
            value={round.stats.claimedCount}
          />
          <StatCard
            icon={<CheckCircle2 className="size-3.5" />}
            label="Completed"
            value={round.stats.completedCount}
          />
        </div>

        {round.stats.totalBounties > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {claimedOrCompleted} / {round.stats.totalBounties} bounties
                claimed or completed
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/40">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  isActive ? "bg-yellow-500" : "bg-primary",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <Zap className="size-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-bold mb-2">No Lightning Round Found</h2>
      <p className="text-muted-foreground mb-6">
        There are no active or upcoming Lightning Rounds right now.
      </p>
      <Button asChild variant="outline">
        <Link href="/bounty">Browse All Bounties</Link>
      </Button>
    </div>
  );
}

// useSearchParams requires this component to live inside a Suspense boundary
function LightningRoundContent() {
  const searchParams = useSearchParams();
  const windowId = searchParams.get("id");

  const {
    activeRound,
    upcomingRounds,
    isLoading: listLoading,
  } = useLightningRounds();

  const targetId = windowId ?? activeRound?.id ?? upcomingRounds[0]?.id ?? null;

  const { round, groupedByType, isLoading, isError } =
    useLightningRoundBounties(targetId);

  const categories = Object.keys(groupedByType);
  const isLoadingAny = isLoading || listLoading;

  // covers stale ?id= param that points at a deleted/missing round
  const showEmpty =
    !isLoadingAny && (isError || (!round && categories.length === 0));

  return (
    <div className="min-h-screen text-foreground pb-20 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-125 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2">
            <Link href="/bounty">
              <ArrowLeft className="size-4" />
              Back to Bounties
            </Link>
          </Button>
        </div>

        {isLoadingAny ? (
          <PageSkeleton />
        ) : showEmpty ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            <main className="flex-1 min-w-0 space-y-10">
              {round && <RoundHeader round={round} />}

              {categories.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-muted/30 rounded-2xl">
                  <Zap className="size-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Bounties for this round haven&apos;t been published yet.
                    Check back soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {categories.map((cat) => (
                    <CategorySection
                      key={cat}
                      category={cat}
                      bounties={groupedByType[cat]}
                    />
                  ))}
                </div>
              )}
            </main>

            <aside className="w-full lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                <LightningRoundSchedule maxUpcoming={3} maxPast={2} />
                <div className="hidden lg:block">
                  <MiniLeaderboard className="w-full" />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LightningRoundPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LightningRoundContent />
    </Suspense>
  );
}
