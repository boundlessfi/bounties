import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useEscrowPool,
  useEscrowSlots,
  useFeeCalculation,
} from "../use-escrow";
import React from "react";

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("use-escrow hooks", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  describe("useEscrowPool", () => {
    it("should return pool data for a valid pool ID", async () => {
      const { result } = renderHook(() => useEscrowPool("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        poolId: "1",
        totalAmount: 500,
        asset: "USDC",
        isLocked: true,
        expiry: expect.any(String),
        releasedAmount: 0,
        status: "Escrowed",
      });
    });

    it("should return null for an invalid pool ID", async () => {
      const { result } = renderHook(() => useEscrowPool("invalid-id"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe("useEscrowSlots", () => {
    it("should return slots for a valid pool ID", async () => {
      const { result } = renderHook(() => useEscrowSlots("2"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]?.amount).toBe(150);
    });

    it("should return empty array for an invalid pool ID", async () => {
      const { result } = renderHook(() => useEscrowSlots("invalid-id"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe("useFeeCalculation", () => {
    it("should return fee breakdown for FIXED_PRICE", async () => {
      const { result } = renderHook(
        () => useFeeCalculation(1000, "FIXED_PRICE"),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        grossAmount: 1000,
        platformFee: 50,
        insuranceFee: 10,
        netPayout: 940,
      });
    });

    it("should return fee breakdown for COMPETITION", async () => {
      const { result } = renderHook(
        () => useFeeCalculation(1000, "COMPETITION"),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        grossAmount: 1000,
        platformFee: 80,
        insuranceFee: 20,
        netPayout: 900,
      });
    });
  });
});
