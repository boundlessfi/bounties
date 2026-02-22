import { useQuery } from "@tanstack/react-query";
import { transparencyApi } from "@/lib/api/transparency";

export const TRANSPARENCY_KEYS = {
  all: ["transparency"] as const,
  stats: () => [...TRANSPARENCY_KEYS.all, "stats"] as const,
  payouts: (limit: number) =>
    [...TRANSPARENCY_KEYS.all, "payouts", limit] as const,
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: TRANSPARENCY_KEYS.stats(),
    queryFn: () => transparencyApi.getStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useRecentPayouts = (limit = 10) => {
  return useQuery({
    queryKey: TRANSPARENCY_KEYS.payouts(limit),
    queryFn: () => transparencyApi.getRecentPayouts(limit),
    staleTime: 1000 * 60 * 5,
  });
};
