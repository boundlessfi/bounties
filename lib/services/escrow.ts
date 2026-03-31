import {
  EscrowPool,
  EscrowSlot,
  FeeBreakdown,
  RefundResult,
  CancellationRecord,
} from "@/types/escrow";

export class EscrowService {
  // Mock data mapping bountyId/poolId to EscrowPool and Slots
  private static pools: Record<string, EscrowPool> = {
    // Escrowed pool
    "1": {
      poolId: "1",
      totalAmount: 500,
      asset: "USDC",
      isLocked: true,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      releasedAmount: 0,
      status: "Escrowed",
    },
    // Partially Released pool
    "2": {
      poolId: "2",
      totalAmount: 300,
      asset: "USDC",
      isLocked: true,
      expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      releasedAmount: 150,
      status: "Partially Released",
    },
    // Fully Released pool
    "3": {
      poolId: "3",
      totalAmount: 200,
      asset: "USDC",
      isLocked: false,
      expiry: null,
      releasedAmount: 200,
      status: "Fully Released",
    },
  };

  private static slots: Record<string, EscrowSlot[]> = {
    "1": [
      {
        index: 0,
        recipientAddress: "GBSX...A2M4",
        amount: 500,
        status: "Pending",
      },
    ],
    "2": [
      {
        index: 0,
        recipientAddress: "GC2F...9KPL",
        amount: 150,
        status: "Released",
      },
      {
        index: 1,
        recipientAddress: "GD8A...5RTY",
        amount: 150,
        status: "Pending",
      },
    ],
    "3": [
      {
        index: 0,
        recipientAddress: "GBX3...B4C9",
        amount: 200,
        status: "Released",
      },
    ],
  };

  private static cancellations: Record<string, CancellationRecord> = {};

  /**
   * TEST-ONLY: Resets static properties to initial state to ensure tests
   * do not bleed into each other due to static mutation.
   */
  static __resetForTesting() {
    this.pools = {
      "1": {
        poolId: "1",
        totalAmount: 500,
        asset: "USDC",
        isLocked: true,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        releasedAmount: 0,
        status: "Escrowed",
      },
      "2": {
        poolId: "2",
        totalAmount: 300,
        asset: "USDC",
        isLocked: true,
        expiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        releasedAmount: 150,
        status: "Partially Released",
      },
      "3": {
        poolId: "3",
        totalAmount: 200,
        asset: "USDC",
        isLocked: false,
        expiry: null,
        releasedAmount: 200,
        status: "Fully Released",
      },
    };
    // Note: slots are not modified by cancellation logic currently
    this.cancellations = {};
  }

  /**
   * Get the escrow pool details for a given pool ID (usually bounty ID in our mock).
   */
  static async getPool(poolId: string): Promise<EscrowPool | null> {
    await this.simulateDelay();
    return this.pools[poolId] || null;
  }

  /**
   * Get the release slots for a given pool ID.
   */
  static async getSlots(poolId: string): Promise<EscrowSlot[]> {
    await this.simulateDelay();
    return this.slots[poolId] || [];
  }

  /**
   * Calculate the fee breakdown for a given amount.
   * Based on subType, fees can vary (mocking a 5% platform fee and 1% insurance fee).
   */
  static async calculateFee(
    amount: number,
    subType: string,
  ): Promise<FeeBreakdown> {
    await this.simulateDelay();

    // Default mock rates
    let platformRate = 0.05;
    let insuranceRate = 0.01;

    // Adjust rates based on some mock logic for different types
    if (subType === "COMPETITION") {
      platformRate = 0.08;
      insuranceRate = 0.02;
    } else if (subType === "MILESTONE_BASED") {
      platformRate = 0.06;
      insuranceRate = 0.01;
    }

    const platformFee = Number((amount * platformRate).toFixed(2));
    const insuranceFee = Number((amount * insuranceRate).toFixed(2));
    const netPayout = Number((amount - platformFee - insuranceFee).toFixed(2));

    return {
      grossAmount: amount,
      platformFee,
      insuranceFee,
      netPayout,
    };
  }

  /**
   * Cancel a bounty and initiate the escrow refund.
   * Maps to BountyRegistry.cancel_bounty(creator, bounty_id) on-chain.
   * Returns the cancellation record including refund details.
   */
  static async cancelBounty(
    bountyId: string,
    cancelledBy: string,
    reason: string,
  ): Promise<CancellationRecord> {
    await this.simulateDelay(800);

    const pool = this.pools[bountyId];
    if (!pool) {
      throw new Error(`No escrow pool found for bounty ${bountyId}`);
    }

    if (pool.status === "Fully Released") {
      throw new Error(
        "Cannot cancel: all funds have already been released to recipients",
      );
    }

    if (pool.status === "Refunded") {
      throw new Error("This bounty has already been refunded");
    }

    // Determine refund amount (total minus already released)
    const refundableAmount = pool.totalAmount - pool.releasedAmount;
    const txHash = this.generateMockTxHash();

    const refund: RefundResult = {
      transactionHash: txHash,
      poolId: pool.poolId,
      refundedAmount: refundableAmount,
      asset: pool.asset,
      status: "completed",
      timestamp: new Date().toISOString(),
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
    };

    // Update pool state
    this.pools[bountyId] = {
      ...pool,
      isLocked: false,
      status: "Refunded",
    };

    const record: CancellationRecord = {
      bountyId,
      cancelledBy,
      reason,
      cancelledAt: new Date().toISOString(),
      refund,
    };

    this.cancellations[bountyId] = record;
    return record;
  }

  /**
   * Reverts a cancellation by restoring the pool to its previous state.
   */
  static async revertCancel(bountyId: string): Promise<void> {
    await this.simulateDelay(400);

    const pool = this.pools[bountyId];
    if (!pool) return;

    // Restore status based on existing releasedAmount
    const status = pool.releasedAmount > 0 ? "Partially Released" : "Escrowed";

    this.pools[bountyId] = {
      ...pool,
      isLocked: true,
      status,
    };

    delete this.cancellations[bountyId];
  }

  /**
   * Refund all funds in an escrow pool.
   * Maps to CoreEscrow.refund_all(pool_id) on-chain.
   */
  static async refundAll(poolId: string): Promise<RefundResult> {
    await this.simulateDelay(600);

    const pool = this.pools[poolId];
    if (!pool) {
      throw new Error(`No escrow pool found: ${poolId}`);
    }

    if (pool.status === "Refunded") {
      throw new Error("Pool has already been refunded");
    }

    const txHash = this.generateMockTxHash();
    const refundedAmount = pool.totalAmount - pool.releasedAmount;

    this.pools[poolId] = {
      ...pool,
      isLocked: false,
      status: "Refunded",
    };

    return {
      transactionHash: txHash,
      poolId,
      refundedAmount,
      asset: pool.asset,
      status: "completed",
      timestamp: new Date().toISOString(),
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
    };
  }

  /**
   * Refund remaining (unreleased) funds in an escrow pool.
   * Maps to CoreEscrow.refund_remaining(pool_id) on-chain.
   */
  static async refundRemaining(poolId: string): Promise<RefundResult> {
    await this.simulateDelay(600);

    const pool = this.pools[poolId];
    if (!pool) {
      throw new Error(`No escrow pool found: ${poolId}`);
    }

    if (pool.status === "Refunded") {
      throw new Error("Pool has already been refunded");
    }

    if (pool.status === "Fully Released") {
      throw new Error("No remaining funds to refund");
    }

    const txHash = this.generateMockTxHash();
    const refundedAmount = pool.totalAmount - pool.releasedAmount;

    this.pools[poolId] = {
      ...pool,
      isLocked: false,
      status: pool.releasedAmount > 0 ? "Partially Released" : "Refunded",
    };

    return {
      transactionHash: txHash,
      poolId,
      refundedAmount,
      asset: pool.asset,
      status: "completed",
      timestamp: new Date().toISOString(),
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
    };
  }

  /**
   * Get cancellation record for a bounty, if it exists.
   */
  static async getCancellation(
    bountyId: string,
  ): Promise<CancellationRecord | null> {
    await this.simulateDelay();
    return this.cancellations[bountyId] || null;
  }

  private static simulateDelay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static generateMockTxHash(): string {
    const chars = "abcdef0123456789";
    return Array.from({ length: 64 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  }
}
