import { useQuery } from "@tanstack/react-query";
import { EscrowService } from "@/lib/services/escrow";

export const escrowKeys = {
  all: ["escrow"] as const,
  pool: (poolId: string) => [...escrowKeys.all, "pool", poolId] as const,
  slots: (poolId: string) => [...escrowKeys.all, "slots", poolId] as const,
  fee: (amount: number, subType: string) =>
    [...escrowKeys.all, "fee", amount, subType] as const,
  cancellation: (bountyId: string) =>
    [...escrowKeys.all, "cancellation", bountyId] as const,
};

/**
 * Fetch escrow pool details for a given pool ID.
 */
export function useEscrowPool(poolId: string) {
  return useQuery({
    queryKey: escrowKeys.pool(poolId),
    queryFn: () => EscrowService.getPool(poolId),
    enabled: !!poolId,
  });
}

/**
 * Fetch the release slots for a given pool ID.
 */
export function useEscrowSlots(poolId: string) {
  return useQuery({
    queryKey: escrowKeys.slots(poolId),
    queryFn: () => EscrowService.getSlots(poolId),
    enabled: !!poolId,
  });
}

/**
 * Fetch the calculated fee breakdown.
 */
export function useFeeCalculation(amount: number, subType: string) {
  return useQuery({
    queryKey: escrowKeys.fee(amount, subType),
    queryFn: () => EscrowService.calculateFee(amount, subType),
    enabled: amount > 0 && !!subType,
  });
}

/**
 * Fetch the cancellation record for a bounty.
 * Only enabled when the bounty status is CANCELLED.
 */
export function useCancellation(bountyId: string, enabled = true) {
  return useQuery({
    queryKey: escrowKeys.cancellation(bountyId),
    queryFn: () => EscrowService.getCancellation(bountyId),
    enabled: !!bountyId && enabled,
  });
}
