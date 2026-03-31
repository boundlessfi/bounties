"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Trophy,
  Clock,
  DollarSign,
  Layers,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BountyCard } from "@/components/bounty/bounty-card";
import { BountyListSkeleton } from "@/components/bounty/bounty-card-skeleton";
import {
  useLightningRounds,
  useLightningRoundBounties,
  useCountdown,
} from "@/hooks/use-lightning-rounds";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { BountyFieldsFragment } from "@/lib/graphql/generated";

const CATEGORY_LABELS: Record<string, string> = {
  FIXED_PRICE: "Fixed Price",
  MILESTONE_BASED: "Milestone Based",
  COMPETITION: "Competition",
};

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
      <div className="flex items-center gap-1.5 text-yellow-500/80 text-xs font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function CountdownBlock({ targetDate, label }: { targetDate: string | null; label: string }) {
  const cd = useCountdown(targetDate);
  if (cd.expired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-1.5 font-mono font-bold text-2xl text-yellow-300">
        <span>{pad(cd.days)}d</span>
        <span className="opacity-40">:</span>
        <span>{pad(cd.hours)}h</span>
        <span className="opacity-40">:</span>
        <span>{pad(cd.minutes)}m</span>
        <span className="opacity-40">:</span>
        <span>{pad(cd.seconds)}s</span>
      </div>
    </div>
  );
}

function ProgressTracker({
  completedCount,
  total,
}: {
  completedCount: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Round progress</span>
        <span className="font-medium">
          {completedCount} / {total} claimed
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-right">{pct}% complete</div>
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
        <h3 className="text-base font-semibold">
          {CATEGORY_LABELS[category] ?? category}
        </h3>
        <Badge variant="outline" className="text-xs">
          {bounties.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
        {bounties.map((bounty) => (
          <Link key={bounty.id} href={`/bounty/${bounty.id}`} className="h-full block">
            <BountyCard bounty={bounty} />
          </Link>
        ))}
      </div>
    </section>
  );
}

function RoundSelector({
  rounds,
  activeId,
}: {
  rounds: { id: string; name: string; status: string }[];
  activeId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {rounds.map((r) => (
        <Link
          key={r.id}
          href={`/bounty/lightning-round?windowId=${r.id}`}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full border transition-all",
            r.id === activeId
              ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-300 font-medium"
              : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
          )}
        >
          {r.name}
        </Link>
      ))}
    </div>
  );
}

export default function LightningRoundPage() {
  const searchParams = useSearchParams();
  const windowIdParam = searchParams.get("windowId");

  const { rounds, activeRound, isLoading: roundsLoading } = useLightningRounds();

  const currentRound = windowIdParam
    ? rounds.find((r) => r.id === windowIdParam) ?? activeRound
    : activeRound;

  const {
    byCategory,
    totalValue,
    completedCount,
    total,
    isLoading: bountiesLoading,
    isError,
  } = useLightningRoundBounties(currentRound?.id ?? "");

  const isActive = currentRound?.status.toLowerCase() === "active";
  const isEnded =
    currentRound?.endDate && new Date(currentRound.endDate) < new Date();
  const countdownTarget = isActive ? currentRound?.endDate : currentRound?.startDate;

  const categoryEntries = Object.entries(byCategory).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div className="min-h-screen text-foreground pb-20">
      {/* Background glow */}
      <div className="fixed top-0 left-0 w-full h-96 bg-yellow-500/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 py-10 relative z-10 max-w-7xl">
        {/* Back nav */}
        <div className="mb-6">
          <Link
            href="/bounty"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bounties
          </Link>
        </div>

        {/* Hero header */}
        <div className="relative rounded-2xl overflow-hidden border border-yellow-500/30 bg-gradient-to-br from-yellow-950/40 via-background to-amber-950/20 mb-8 p-6 md:p-10">
          <div className="absolute -top-10 right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30">
                  <Zap className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
                    Lightning Round
                  </span>
                </div>
                {isActive && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Now
                  </Badge>
                )}
                {isEnded && (
                  <Badge variant="outline" className="text-muted-foreground text-[10px]">
                    Ended
                  </Badge>
                )}
              </div>

              {roundsLoading ? (
                <Skeleton className="h-9 w-64 mb-2" />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {currentRound?.name ?? "Lightning Rounds"}
                </h1>
              )}

              <p className="text-muted-foreground mb-6 max-w-xl">
                High-volume curated bounty events occurring every 10 days — 20 to
                50 bounties across all skill categories. Compete, contribute, and
                earn.
              </p>

              {currentRound && (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                  {currentRound.startDate && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4 text-yellow-500/70" />
                      {format(new Date(currentRound.startDate), "MMM d")}
                      {currentRound.endDate &&
                        ` – ${format(new Date(currentRound.endDate), "MMM d, yyyy")}`}
                    </span>
                  )}
                  <CountdownBlock
                    targetDate={countdownTarget ?? null}
                    label={isActive ? "Ends in" : "Starts in"}
                  />
                </div>
              )}
            </div>

            {/* Stats */}
            {!roundsLoading && currentRound && (
              <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-64">
                <StatCard
                  icon={<Layers className="h-3.5 w-3.5" />}
                  label="Bounties"
                  value={String(total || currentRound.bountyCount)}
                />
                <StatCard
                  icon={<DollarSign className="h-3.5 w-3.5" />}
                  label="Total Value"
                  value={`$${(totalValue || currentRound.totalValue).toLocaleString()}`}
                />
                <StatCard
                  icon={<Trophy className="h-3.5 w-3.5" />}
                  label="Completed"
                  value={String(completedCount)}
                />
                <StatCard
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Categories"
                  value={String(currentRound.categories.length || categoryEntries.length)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Round selector */}
        {rounds.length > 1 && (
          <div className="mb-6">
            <RoundSelector
              rounds={rounds}
              activeId={currentRound?.id ?? ""}
            />
          </div>
        )}

        {/* Progress tracker */}
        {currentRound && total > 0 && (
          <div className="mb-8 p-5 rounded-xl border border-border/50 bg-background-card">
            <ProgressTracker completedCount={completedCount} total={total} />
          </div>
        )}

        {/* Bounty grid by category */}
        <div className="space-y-10">
          {bountiesLoading ? (
            <BountyListSkeleton count={6} />
          ) : isError ? (
            <div className="text-center py-16 text-muted-foreground">
              Failed to load bounties for this round.
            </div>
          ) : categoryEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-800 rounded-2xl">
              <Zap className="h-12 w-12 text-yellow-500/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {currentRound ? "No bounties yet" : "No active round"}
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                {currentRound
                  ? "Bounties for this round haven't been added yet. Check back soon."
                  : "There is no active or upcoming Lightning Round at the moment."}
              </p>
              <Button asChild variant="outline">
                <Link href="/bounty" className="flex items-center gap-1.5">
                  Browse all bounties <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            categoryEntries.map(([category, bounties]) => (
              <CategorySection key={category} category={category} bounties={bounties} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
