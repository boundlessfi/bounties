export type EscrowPoolStatus =
  | "Escrowed"
  | "Partially Released"
  | "Fully Released"
  | "Refunded";

export type EscrowSlotStatus = "Pending" | "Released";

export interface EscrowSlot {
  index: number;
  recipientAddress: string;
  amount: number;
  status: EscrowSlotStatus;
}

export interface EscrowPool {
  poolId: string;
  totalAmount: number;
  asset: string;
  isLocked: boolean;
  expiry: string | null;
  releasedAmount: number;
  status: EscrowPoolStatus;
}

export interface FeeBreakdown {
  grossAmount: number;
  platformFee: number;
  insuranceFee: number;
  netPayout: number;
}

export type RefundStatus = "pending" | "processing" | "completed" | "failed";

export interface RefundResult {
  transactionHash: string;
  poolId: string;
  refundedAmount: number;
  asset: string;
  status: RefundStatus;
  timestamp: string;
  explorerUrl: string;
}

export interface CancellationRecord {
  bountyId: string;
  cancelledBy: string;
  reason: string;
  cancelledAt: string;
  refund: RefundResult | null;
}
