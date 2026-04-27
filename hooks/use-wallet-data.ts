import { useQuery } from "@tanstack/react-query";
import {
  fetchAllAssetBalances,
  fetchAssetPricesUsd,
} from "@/lib/stellar/assets";
import { fetchAccountTransactions } from "@/lib/stellar/horizon";
import { rpc, xdr, scValToNative, Address } from "@stellar/stellar-sdk";
import { SMART_WALLET_CONFIG } from "@/lib/smart-wallet/config";

const CORE_ESCROW_CONTRACT_ID =
  process.env.NEXT_PUBLIC_CORE_ESCROW_CONTRACT_ID ?? "";

export const walletKeys = {
  all: ["wallet"] as const,
  assets: (address: string) => [...walletKeys.all, "assets", address] as const,
  transactions: (address: string) =>
    [...walletKeys.all, "transactions", address] as const,
  escrow: (address: string) => [...walletKeys.all, "escrow", address] as const,
};

export function useWalletAssets(address: string | null) {
  return useQuery({
    queryKey: walletKeys.assets(address ?? ""),
    queryFn: () => fetchAllAssetBalances(address!),
    enabled: !!address,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useWalletTransactions(address: string | null) {
  return useQuery({
    queryKey: walletKeys.transactions(address ?? ""),
    queryFn: () => fetchAccountTransactions(address!),
    enabled: !!address,
    staleTime: 2 * 60 * 1000,
  });
}

export interface EscrowEntry {
  bountyId: string;
  amount: number;
  asset: string;
  status: string;
}

export interface EscrowSummaryData {
  totalLocked: number;
  entries: EscrowEntry[];
}

async function fetchEscrowSummary(
  walletContractId: string,
): Promise<EscrowSummaryData> {
  if (!CORE_ESCROW_CONTRACT_ID) {
    return { totalLocked: 0, entries: [] };
  }

  try {
    const server = new rpc.Server(SMART_WALLET_CONFIG.rpcUrl);
    const walletAddr = new Address(walletContractId);
    const key = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("EscrowLocked"),
      walletAddr.toScVal(),
    ]);

    const response = await server.getContractData(
      CORE_ESCROW_CONTRACT_ID,
      key,
      rpc.Durability.Persistent,
    );

    if (response?.val) {
      const native = scValToNative(response.val.contractData().val());
      const xlmUnits =
        typeof native === "bigint"
          ? Number(native) / 10_000_000
          : typeof native === "number"
            ? native
            : 0;
      const prices = await fetchAssetPricesUsd();
      const totalLocked = xlmUnits * (prices["XLM"] ?? 0.12);
      return { totalLocked, entries: [] };
    }
  } catch (err) {
    console.error("[stellar] fetchEscrowSummary failed:", err);
  }

  return { totalLocked: 0, entries: [] };
}

export function useEscrowSummary(address: string | null) {
  return useQuery({
    queryKey: walletKeys.escrow(address ?? ""),
    queryFn: () => fetchEscrowSummary(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
  });
}
