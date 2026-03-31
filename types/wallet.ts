export interface WalletAsset {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenIcon?: string;
  amount: number;
  usdValue: number;
}

export type ActivityType = "earning" | "withdrawal" | "deposit";
export type ActivityStatus = "completed" | "pending" | "failed";

export interface WalletActivity {
  id: string;
  type: ActivityType;
  amount: number;
  currency: string;
  date: string;
  status: ActivityStatus;
  description?: string;
  transactionHash?: string; // Stellar transaction hash for explorer links
}

export interface WalletInfo {
  address: string; // Stellar public key
  displayName: string;
  balance: number;
  balanceCurrency: "USD" | "USDC" | "XLM";
  assets: WalletAsset[];
  recentActivity: WalletActivity[];
  has2FA: boolean;
  isConnected: boolean;
}
