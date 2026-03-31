import { useMemo, useState, useEffect } from "react";
import { useActiveBountiesQuery, useBountiesQuery } from "@/lib/graphql/generated";
import type { BountyFieldsFragment } from "@/lib/graphql/generated";

export interface LightningRound {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  bounties: BountyFieldsFragment[];
  totalValue: number;
  bountyCount: number;
  categories: string[];
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

/**
 * Derives lightning round data from bounties that have a bountyWindow attached.
 * Groups bounties by their associated BountyWindow into LightningRound objects.
 */
export function useLightningRounds() {
  const { data, isLoading, isError, error, refetch } = useActiveBountiesQuery();

  const rounds = useMemo<LightningRound[]>(() => {
    const bounties = data?.activeBounties ?? [];
    const windowMap = new Map<string, LightningRound>();

    for (const bounty of bounties) {
      if (!bounty.bountyWindow) continue;
      const w = bounty.bountyWindow;

      if (!windowMap.has(w.id)) {
        windowMap.set(w.id, {
          id: w.id,
          name: w.name,
          status: w.status,
          startDate: w.startDate ?? null,
          endDate: w.endDate ?? null,
          bounties: [],
          totalValue: 0,
          bountyCount: 0,
          categories: [],
        });
      }

      const round = windowMap.get(w.id)!;
      round.bounties.push(bounty as BountyFieldsFragment);
      round.totalValue += bounty.rewardAmount ?? 0;
      round.bountyCount += 1;

      const category = bounty.type;
      if (!round.categories.includes(category)) {
        round.categories.push(category);
      }
    }

    return Array.from(windowMap.values()).sort((a, b) => {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [data?.activeBounties]);

  const activeRound = useMemo(
    () => rounds.find((r) => r.status.toLowerCase() === "active") ?? rounds[0] ?? null,
    [rounds]
  );

  return { rounds, activeRound, isLoading, isError, error, refetch };
}

/**
 * Fetches bounties that belong to a specific lightning round (bountyWindow).
 */
export function useLightningRoundBounties(windowId: string) {
  const { data, isLoading, isError, error } = useBountiesQuery({
    query: { bountyWindowId: windowId, limit: 50 },
  });

  const bounties = useMemo<BountyFieldsFragment[]>(
    () => (data?.bounties.bounties ?? []) as BountyFieldsFragment[],
    [data?.bounties.bounties]
  );

  const byCategory = useMemo(() => {
    return bounties.reduce<Record<string, BountyFieldsFragment[]>>((acc, b) => {
      const cat = b.type;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(b);
      return acc;
    }, {});
  }, [bounties]);

  const totalValue = useMemo(
    () => bounties.reduce((sum, b) => sum + (b.rewardAmount ?? 0), 0),
    [bounties]
  );

  const completedCount = useMemo(
    () => bounties.filter((b) => b.status === "completed").length,
    [bounties]
  );

  return {
    bounties,
    byCategory,
    totalValue,
    completedCount,
    total: data?.bounties.total ?? 0,
    isLoading,
    isError,
    error,
  };
}

/**
 * Live countdown to a target date. Updates every second on the client.
 */
export function useCountdown(targetDate: string | null): CountdownTime {
  const getTime = (): CountdownTime => {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
    };
  };

  const [time, setTime] = useState<CountdownTime>(getTime);

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  return time;
}
