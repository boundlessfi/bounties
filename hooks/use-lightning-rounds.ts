import { useMemo } from "react";
import {
  useActiveBountiesQuery,
  useBountiesQuery,
  type BountyFieldsFragment,
  type BountyQueryInput,
} from "@/lib/graphql/generated";

/**
 * Per-currency value breakdown.
 * Stored as a map so mixed-currency rounds are represented accurately
 * rather than summing different currencies under one label.
 */
export type CurrencyTotals = Record<string, number>;

/**
 * Represents a Lightning Round (Bounty Window) with enriched metadata.
 * Derived from the existing BountyWindowType in the schema.
 */
export interface LightningRound {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  bounties: BountyFieldsFragment[];
  stats: {
    totalBounties: number;
    /**
     * Value totals broken down by currency.
     * Iterate this for multi-currency display; use primaryCurrency/primaryValue
     * for single-currency shorthand.
     */
    currencyTotals: CurrencyTotals;
    /** Currency with the highest total value — safe for single-currency UI */
    primaryCurrency: string;
    /** Value in primaryCurrency */
    primaryValue: number;
    claimedCount: number;
    completedCount: number;
    categories: string[];
  };
}

// ---------------------------------------------------------------------------
// getRoundPhase
// ---------------------------------------------------------------------------

/**
 * Derives Lightning Round state from a window's dates and status.
 *
 * Guard rules (applied in order):
 *  1. status === "completed"              → ended
 *  2. endDate in the past                 → ended
 *  3. startDate in the future             → upcoming
 *  4. now is between startDate and endDate → active
 *  5. startDate present, no endDate, now >= startDate → active
 *  6. No dates at all                     → upcoming  ← safe default;
 *     avoids rendering a false "Live Now" banner on incomplete data
 */
export function getRoundPhase(
  round: Pick<LightningRound, "startDate" | "endDate" | "status">,
): "upcoming" | "active" | "ended" {
  const now = new Date();
  const start = round.startDate ? new Date(round.startDate) : null;
  const end = round.endDate ? new Date(round.endDate) : null;

  if (round.status?.toLowerCase() === "completed") return "ended";
  if (end && now > end) return "ended";
  if (start && now < start) return "upcoming";
  // No dates at all → upcoming, not active, to avoid false-positive live UI
  if (!start && !end) return "upcoming";
  return "active";
}

// ---------------------------------------------------------------------------
// getRoundCountdownTarget
// ---------------------------------------------------------------------------

/**
 * Returns the countdown target as a numeric timestamp (ms).
 *
 * Returns a number — NOT a Date object — so callers can pass it directly to
 * useCountdown. A numeric value is referentially stable across renders;
 * `new Date(str)` produces a new object identity on every render, which
 * caused the countdown interval to be torn down on every re-render cycle.
 */
export function getRoundCountdownTarget(
  round: Pick<LightningRound, "startDate" | "endDate" | "status">,
): number | null {
  const phase = getRoundPhase(round);
  if (phase === "upcoming" && round.startDate)
    return new Date(round.startDate).getTime();
  if (phase === "active" && round.endDate)
    return new Date(round.endDate).getTime();
  return null;
}

// ---------------------------------------------------------------------------
// groupBountiesByWindow (internal)
// ---------------------------------------------------------------------------

/**
 * Groups bounties by their bountyWindow, building a LightningRound[] list.
 * Bounties without a bountyWindow are excluded.
 *
 * Within each phase, rounds are sorted by the most useful date:
 *   active   → ascending endDate   (soonest to expire first)
 *   upcoming → ascending startDate (soonest to start first)
 *   ended    → descending endDate  (most recently ended first)
 */
function groupBountiesByWindow(
  bounties: BountyFieldsFragment[],
): LightningRound[] {
  const windowMap = new Map<string, LightningRound>();

  for (const bounty of bounties) {
    if (!bounty.bountyWindow) continue;
    const { id, name, status, startDate, endDate } = bounty.bountyWindow;

    if (!windowMap.has(id)) {
      windowMap.set(id, {
        id,
        name,
        status,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        bounties: [],
        stats: {
          totalBounties: 0,
          currencyTotals: {},
          primaryCurrency: "",
          primaryValue: 0,
          claimedCount: 0,
          completedCount: 0,
          categories: [],
        },
      });
    }

    const round = windowMap.get(id)!;
    round.bounties.push(bounty);
    round.stats.totalBounties += 1;

    // Per-currency totals
    const ccy = bounty.rewardCurrency;
    round.stats.currencyTotals[ccy] =
      (round.stats.currencyTotals[ccy] ?? 0) + (bounty.rewardAmount ?? 0);

    const s = bounty.status.toLowerCase();
    if (s === "in_progress") round.stats.claimedCount += 1;
    if (s === "completed") round.stats.completedCount += 1;

    const type = bounty.type.replace(/_/g, " ");
    if (!round.stats.categories.includes(type)) {
      round.stats.categories.push(type);
    }
  }

  // Resolve primaryCurrency — highest total value wins
  for (const round of windowMap.values()) {
    const entries = Object.entries(round.stats.currencyTotals);
    if (entries.length > 0) {
      const [topCurrency, topValue] = entries.reduce((best, curr) =>
        curr[1] > best[1] ? curr : best,
      );
      round.stats.primaryCurrency = topCurrency;
      round.stats.primaryValue = topValue;
    }
  }

  const phaseOrder = { active: 0, upcoming: 1, ended: 2 } as const;

  return Array.from(windowMap.values()).sort((a, b) => {
    const phaseA = getRoundPhase(a);
    const phaseB = getRoundPhase(b);

    if (phaseA !== phaseB) {
      return phaseOrder[phaseA] - phaseOrder[phaseB];
    }

    // Within the same phase, sort by the most meaningful date
    if (phaseA === "active") {
      const eA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
      const eB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
      return eA - eB; // soonest to expire first
    }
    if (phaseA === "upcoming") {
      const sA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const sB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return sA - sB; // soonest to start first
    }
    // ended — most recently ended first
    const eA = a.endDate ? new Date(a.endDate).getTime() : 0;
    const eB = b.endDate ? new Date(b.endDate).getTime() : 0;
    return eB - eA;
  });
}

// ---------------------------------------------------------------------------
// Hook: useActiveLightningRound
// ---------------------------------------------------------------------------

/**
 * Returns the currently active Lightning Round (if any), derived from
 * the existing `activeBounties` query — no new backend work needed.
 */
export function useActiveLightningRound() {
  const { data, isLoading, isError, error } = useActiveBountiesQuery();

  const round = useMemo<LightningRound | null>(() => {
    if (!data?.activeBounties?.length) return null;
    const rounds = groupBountiesByWindow(
      data.activeBounties as BountyFieldsFragment[],
    );
    return rounds.find((r) => getRoundPhase(r) === "active") ?? null;
  }, [data]);

  return { round, isLoading, isError, error };
}

// ---------------------------------------------------------------------------
// Hook: useLightningRounds
// ---------------------------------------------------------------------------

/**
 * Returns all Lightning Rounds (past, active, upcoming) by grouping bounties
 * from the paginated bounties query.
 *
 * Tradeoff: rounds are derived from the bounty list rather than a dedicated
 * "list windows" query (which doesn't exist in the current schema). The
 * `limit` parameter controls how many bounties are fetched. The default of
 * 200 is intentionally generous so older rounds appear in the schedule
 * widget. If the platform grows significantly, a dedicated bountyWindows
 * query should be added server-side.
 *
 * @param params - Optional BountyQueryInput overrides.
 * @param limit  - Max bounties to fetch. Defaults to 200.
 */
export function useLightningRounds(params?: BountyQueryInput, limit = 200) {
  const { data, isLoading, isError, error, refetch } = useBountiesQuery({
    query: { limit, sortBy: "createdAt", sortOrder: "desc", ...params },
  });

  const { rounds, activeRound, upcomingRounds, endedRounds } = useMemo(() => {
    const allBounties =
      (data?.bounties?.bounties as BountyFieldsFragment[]) ?? [];
    const all = groupBountiesByWindow(allBounties);

    return {
      rounds: all,
      activeRound: all.find((r) => getRoundPhase(r) === "active") ?? null,
      upcomingRounds: all.filter((r) => getRoundPhase(r) === "upcoming"),
      endedRounds: all.filter((r) => getRoundPhase(r) === "ended"),
    };
  }, [data]);

  return {
    rounds,
    activeRound,
    upcomingRounds,
    endedRounds,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// ---------------------------------------------------------------------------
// Hook: useLightningRoundBounties
// ---------------------------------------------------------------------------

/**
 * Fetches bounties for a specific Lightning Round by bountyWindowId.
 * Groups them by bounty type for the dedicated round page.
 *
 * Query is disabled when windowId is falsy to avoid firing a spurious
 * request on first mount before the active round ID is resolved.
 *
 * Graceful degradation: if `round` is null but `groupedByType` has data
 * (e.g. stale cache / partial fragment), the page can still render the
 * category sections without a header.
 */
export function useLightningRoundBounties(windowId: string | null) {
  const enabled = !!windowId;

  const { data, isLoading, isError, error } = useBountiesQuery(
    { query: { bountyWindowId: windowId ?? "", limit: 100 } },
    { enabled },
  );

  const { round, groupedByType } = useMemo(() => {
    const bounties = (data?.bounties?.bounties as BountyFieldsFragment[]) ?? [];

    const rounds = groupBountiesByWindow(bounties);
    const found = rounds[0] ?? null;

    const grouped: Record<string, BountyFieldsFragment[]> = {};
    for (const b of bounties) {
      const key = b.type.replace(/_/g, " ");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(b);
    }

    return { round: found, groupedByType: grouped };
  }, [data]);

  return { round, groupedByType, isLoading, isError, error, enabled };
}
