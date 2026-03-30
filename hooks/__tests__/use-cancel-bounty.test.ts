import { EscrowService } from "@/lib/services/escrow";

describe("EscrowService - Cancellation & Refund", () => {
  // Reset the static mock state between tests by re-importing
  // EscrowService is a static singleton, so tests may have side effects
  // on each other for the cancel/refund methods. We test in a careful order.

  describe("cancelBounty", () => {
    it("should cancel a bounty and return a full refund for Escrowed pools", async () => {
      const record = await EscrowService.cancelBounty(
        "1",
        "user-123",
        "Requirements changed",
      );

      expect(record.bountyId).toBe("1");
      expect(record.cancelledBy).toBe("user-123");
      expect(record.reason).toBe("Requirements changed");
      expect(record.cancelledAt).toBeDefined();
      expect(record.refund).not.toBeNull();
      expect(record.refund!.refundedAmount).toBe(500); // full amount
      expect(record.refund!.asset).toBe("USDC");
      expect(record.refund!.status).toBe("completed");
      expect(record.refund!.transactionHash).toHaveLength(64);
      expect(record.refund!.explorerUrl).toContain("stellar.expert");
    });

    it("should update pool status to Refunded after cancellation", async () => {
      // Pool 1 was already cancelled above, verify state
      const pool = await EscrowService.getPool("1");
      expect(pool?.status).toBe("Refunded");
      expect(pool?.isLocked).toBe(false);
    });

    it("should throw when cancelling an already refunded pool", async () => {
      await expect(
        EscrowService.cancelBounty("1", "user-123", "test"),
      ).rejects.toThrow("already been refunded");
    });

    it("should throw when cancelling a fully released pool", async () => {
      await expect(
        EscrowService.cancelBounty("3", "user-123", "test"),
      ).rejects.toThrow("already been released");
    });

    it("should throw for a non-existent pool", async () => {
      await expect(
        EscrowService.cancelBounty("999", "user-123", "test"),
      ).rejects.toThrow("No escrow pool found");
    });
  });

  describe("refundAll", () => {
    it("should refund full amount for a partially released pool", async () => {
      const result = await EscrowService.refundAll("2");

      expect(result.refundedAmount).toBe(300); // totalAmount
      expect(result.asset).toBe("USDC");
      expect(result.status).toBe("completed");
      expect(result.transactionHash).toHaveLength(64);
    });

    it("should throw for already refunded pool", async () => {
      await expect(EscrowService.refundAll("2")).rejects.toThrow(
        "already been refunded",
      );
    });
  });

  describe("refundRemaining", () => {
    it("should throw for fully released pool", async () => {
      await expect(EscrowService.refundRemaining("3")).rejects.toThrow(
        "No remaining funds",
      );
    });

    it("should throw for non-existent pool", async () => {
      await expect(EscrowService.refundRemaining("999")).rejects.toThrow(
        "No escrow pool found",
      );
    });
  });

  describe("getCancellation", () => {
    it("should return cancellation record for cancelled bounty", async () => {
      const record = await EscrowService.getCancellation("1");
      expect(record).not.toBeNull();
      expect(record!.bountyId).toBe("1");
      expect(record!.reason).toBe("Requirements changed");
    });

    it("should return null for non-cancelled bounty", async () => {
      const record = await EscrowService.getCancellation("999");
      expect(record).toBeNull();
    });
  });
});
