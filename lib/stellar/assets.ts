import { Asset, rpc } from "@stellar/stellar-sdk";
import { SMART_WALLET_CONFIG } from "@/lib/smart-wallet/config";
import { WalletAsset } from "@/types/wallet";

export interface SupportedAsset {
  id: string;
  symbol: string;
  name: string;
  asset: Asset;
}

export function getSupportedAssets(): SupportedAsset[] {
  const assets: SupportedAsset[] = [
    {
      id: "xlm",
      symbol: "XLM",
      name: "Stellar Lumens",
      asset: Asset.native(),
    },
  ];

  const usdcIssuer = process.env.NEXT_PUBLIC_USDC_ISSUER;
  if (usdcIssuer) {
    try {
      assets.push({
        id: "usdc",
        symbol: "USDC",
        name: "USD Coin",
        asset: new Asset("USDC", usdcIssuer),
      });
    } catch {
      console.warn("[stellar] Invalid USDC issuer, skipping");
    }
  }

  const eurcIssuer = process.env.NEXT_PUBLIC_EURC_ISSUER;
  if (eurcIssuer) {
    try {
      assets.push({
        id: "eurc",
        symbol: "EURC",
        name: "Euro Coin",
        asset: new Asset("EURC", eurcIssuer),
      });
    } catch {
      console.warn("[stellar] Invalid EURC issuer, skipping");
    }
  }

  return assets;
}

const STROOPS_PER_UNIT = 10_000_000;

export async function fetchAssetBalance(
  walletContractId: string,
  asset: Asset,
): Promise<number> {
  try {
    const server = new rpc.Server(SMART_WALLET_CONFIG.rpcUrl);
    const result = await server.getSACBalance(
      walletContractId,
      asset,
      SMART_WALLET_CONFIG.networkPassphrase,
    );
    if (result.balanceEntry) {
      return Number(result.balanceEntry.amount) / STROOPS_PER_UNIT;
    }
    return 0;
  } catch (err) {
    console.error("[stellar] fetchAssetBalance failed:", err);
    throw err;
  }
}

export async function fetchAssetPricesUsd(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=stellar%2Cusd-coin%2Ceuro-coin&vs_currencies=usd",
      { cache: "no-store" },
    );
    if (!response.ok) throw new Error("price fetch failed");
    const data = (await response.json()) as Record<string, { usd?: number }>;
    return {
      XLM: data["stellar"]?.usd ?? 0.12,
      USDC: data["usd-coin"]?.usd ?? 1.0,
      EURC: data["euro-coin"]?.usd ?? 1.08,
    };
  } catch {
    return { XLM: 0.12, USDC: 1.0, EURC: 1.08 };
  }
}

export async function fetchAllAssetBalances(
  walletContractId: string,
): Promise<WalletAsset[]> {
  if (!SMART_WALLET_CONFIG.rpcUrl) {
    throw new Error("[stellar] RPC URL not configured");
  }

  const [prices, supportedAssets] = await Promise.all([
    fetchAssetPricesUsd(),
    Promise.resolve(getSupportedAssets()),
  ]);

  const results = await Promise.all(
    supportedAssets.map(async (supported) => {
      const amount = await fetchAssetBalance(walletContractId, supported.asset);
      const priceUsd = prices[supported.symbol] ?? 0;
      return {
        id: supported.id,
        tokenSymbol: supported.symbol,
        tokenName: supported.name,
        amount,
        usdValue: amount * priceUsd,
      };
    }),
  );

  return results;
}
