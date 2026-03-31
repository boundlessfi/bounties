import { useQuery } from "@tanstack/react-query";
import { sparkCreditsApi } from "@/lib/api/spark-credits";

export const SPARK_CREDITS_KEYS = {
  all: ["sparkCredits"] as const,
  balance: (userId: string) =>
    [...SPARK_CREDITS_KEYS.all, "balance", userId] as const,
  history: (userId: string, limit?: number) =>
    [...SPARK_CREDITS_KEYS.all, "history", userId, limit] as const,
};

export function useSparkCreditsBalance(userId: string) {
  return useQuery({
    queryKey: SPARK_CREDITS_KEYS.balance(userId),
    queryFn: () => sparkCreditsApi.fetchBalance(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

const DEFAULT_HISTORY_LIMIT = 20;

export function useSparkCreditsHistory(
  userId: string,
  limit = DEFAULT_HISTORY_LIMIT,
) {
  return useQuery({
    queryKey: SPARK_CREDITS_KEYS.history(userId, limit),
    queryFn: () => sparkCreditsApi.fetchHistory(userId, { limit }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
