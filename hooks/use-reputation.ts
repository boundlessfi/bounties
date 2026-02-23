import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reputationApi } from "@/lib/api/reputation";
import { RateContributorInput } from "@/types/reputation";

export const REPUTATION_KEYS = {
  all: ["reputation"] as const,
  user: (userId: string) => [...REPUTATION_KEYS.all, "user", userId] as const,
  wallet: (address: string) =>
    [...REPUTATION_KEYS.all, "wallet", address] as const,
  me: () => [...REPUTATION_KEYS.all, "me"] as const,
  completionHistory: (userId: string, limit?: number) =>
    [...REPUTATION_KEYS.all, "completion-history", userId, limit] as const,
};

export const useContributorReputation = (userId: string) => {
  return useQuery({
    queryKey: REPUTATION_KEYS.user(userId),
    queryFn: () => reputationApi.fetchContributorReputation(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const DEFAULT_COMPLETION_HISTORY_LIMIT = 50;

export const useCompletionHistory = (
  userId: string,
  limit = DEFAULT_COMPLETION_HISTORY_LIMIT,
) => {
  return useQuery({
    queryKey: REPUTATION_KEYS.completionHistory(userId, limit),
    queryFn: () => reputationApi.fetchCompletionHistory(userId, { limit }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useReputationByWallet = (address: string) => {
  return useQuery({
    queryKey: REPUTATION_KEYS.wallet(address),
    queryFn: () => reputationApi.fetchContributorByWallet(address),
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMyReputation = () => {
  return useQuery({
    queryKey: REPUTATION_KEYS.me(),
    queryFn: () => reputationApi.fetchMyReputation(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRateContributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RateContributorInput) =>
      reputationApi.rateContributor(data),
    onSuccess: (_, variables) => {
      // Invalidate the contributor's reputation to reflect changes
      queryClient.invalidateQueries({
        queryKey: REPUTATION_KEYS.user(variables.contributorId),
      });
    },
  });
};

export const useLinkWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reputationApi.linkWalletToReputation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPUTATION_KEYS.me() });
    },
  });
};

export const usePrefetchReputation = () => {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: REPUTATION_KEYS.user(userId),
      queryFn: () => reputationApi.fetchContributorReputation(userId),
      staleTime: 1000 * 60 * 5,
    });
  };
};
