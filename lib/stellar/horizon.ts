import { Horizon } from "@stellar/stellar-sdk";
import { WalletActivity } from "@/types/wallet";
import { SMART_WALLET_CONFIG } from "@/lib/smart-wallet/config";

function getHorizonUrl(): string {
  const isTestnet = SMART_WALLET_CONFIG.networkPassphrase.includes("Test SDF");
  return isTestnet
    ? "https://horizon-testnet.stellar.org"
    : "https://horizon.stellar.org";
}

let horizonInstance: Horizon.Server | null = null;

export function getHorizonServer(): Horizon.Server {
  if (!horizonInstance) {
    horizonInstance = new Horizon.Server(getHorizonUrl());
  }
  return horizonInstance;
}

type HorizonOpRecord = {
  id: string;
  type: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  to?: string;
  from?: string;
  created_at: string;
  transaction_hash: string;
};

export async function fetchAccountTransactions(
  address: string,
): Promise<WalletActivity[]> {
  try {
    const server = getHorizonServer();
    const response = await server
      .payments()
      .forAccount(address)
      .order("desc")
      .limit(50)
      .call();

    return (response.records as unknown as HorizonOpRecord[])
      .map((op, index) => {
        const amount = parseFloat(op.amount ?? "0");
        const isIncoming = op.to === address;
        const asset =
          op.asset_type === "native" ? "XLM" : (op.asset_code ?? "UNKNOWN");
        const counterparty = isIncoming ? op.from : op.to;

        return {
          id: op.id || `tx-${index}`,
          type: isIncoming ? ("deposit" as const) : ("withdrawal" as const),
          amount,
          currency: asset,
          date: op.created_at,
          status: "completed" as const,
          description: isIncoming ? "Incoming payment" : "Outgoing payment",
          transactionHash: op.transaction_hash,
          counterparty,
        };
      })
      .filter((tx) => tx.amount > 0);
  } catch (err) {
    console.error("[stellar] fetchAccountTransactions failed:", err);
    throw err;
  }
}
