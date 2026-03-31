/**
 * Stellar Explorer Integration Utilities
 *
 * Provides URL generation for Stellar explorers to link transactions,
 * accounts, and contracts for transparency and verification.
 *
 * Uses @stellar/stellar-sdk StrKey for proper checksum validation.
 */

import { StrKey } from "@stellar/stellar-sdk";

export type StellarNetwork = "public" | "testnet";
export type ExplorerType = "transaction" | "account" | "contract";

export interface ExplorerConfig {
  name: string;
  baseUrl: string;
  /** Path template per network: keys are "public" and "testnet" */
  networkPaths: Record<
    StellarNetwork,
    {
      transaction: string;
      account: string;
      contract: string;
    }
  >;
}

// Supported Stellar explorers with per-network path configuration
const EXPLORERS: Record<string, ExplorerConfig> = {
  "stellar.expert": {
    name: "Stellar Expert",
    baseUrl: "https://stellar.expert",
    networkPaths: {
      public: {
        transaction: "/explorer/public/tx/",
        account: "/explorer/public/account/",
        contract: "/explorer/public/contract/",
      },
      testnet: {
        transaction: "/explorer/testnet/tx/",
        account: "/explorer/testnet/account/",
        contract: "/explorer/testnet/contract/",
      },
    },
  },
  "stellarchain.io": {
    name: "Stellar Chain",
    baseUrl: "https://stellarchain.io",
    networkPaths: {
      public: {
        transaction: "/tx/",
        account: "/account/",
        contract: "/contract/",
      },
      testnet: {
        transaction: "/tx/",
        account: "/account/",
        contract: "/contract/",
      },
    },
  },
};

const DEFAULT_EXPLORER = "stellar.expert";

/**
 * Returns the configured Stellar network from environment variable.
 * Maps "mainnet" / "public" → "public", defaults to "testnet" otherwise.
 */
export function getStellarNetwork(): StellarNetwork {
  const raw = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
  return raw === "public" || raw === "mainnet" ? "public" : "testnet";
}

/**
 * Gets the base URL for the given network and explorer.
 * stellarchain.io uses a subdomain for testnet; stellar.expert uses paths.
 */
function getExplorerBaseUrl(explorer: string, network: StellarNetwork): string {
  const config = EXPLORERS[explorer] || EXPLORERS[DEFAULT_EXPLORER];

  if (network === "testnet" && explorer === "stellarchain.io") {
    return "https://testnet.stellarchain.io";
  }

  return config.baseUrl;
}

/**
 * Gets the explorer paths for the given network.
 */
function getExplorerPaths(
  explorer: string,
  network: StellarNetwork,
): ExplorerConfig["networkPaths"]["public"] {
  const config = EXPLORERS[explorer] || EXPLORERS[DEFAULT_EXPLORER];
  return config.networkPaths[network];
}

/**
 * Generates a Stellar explorer URL for a transaction.
 */
export function getTransactionUrl(
  txHash: string,
  network?: StellarNetwork,
  explorer: string = DEFAULT_EXPLORER,
): string {
  if (!txHash) {
    throw new Error("Transaction hash is required");
  }

  const resolvedNetwork = network || getStellarNetwork();
  const baseUrl = getExplorerBaseUrl(explorer, resolvedNetwork);
  const paths = getExplorerPaths(explorer, resolvedNetwork);

  return `${baseUrl}${paths.transaction}${txHash}`;
}

/**
 * Generates a Stellar explorer URL for an account.
 */
export function getAccountUrl(
  address: string,
  network?: StellarNetwork,
  explorer: string = DEFAULT_EXPLORER,
): string {
  if (!address) {
    throw new Error("Account address is required");
  }

  const resolvedNetwork = network || getStellarNetwork();
  const baseUrl = getExplorerBaseUrl(explorer, resolvedNetwork);
  const paths = getExplorerPaths(explorer, resolvedNetwork);

  return `${baseUrl}${paths.account}${address}`;
}

/**
 * Generates a Stellar explorer URL for a contract.
 */
export function getContractUrl(
  contractId: string,
  network?: StellarNetwork,
  explorer: string = DEFAULT_EXPLORER,
): string {
  if (!contractId) {
    throw new Error("Contract ID is required");
  }

  const resolvedNetwork = network || getStellarNetwork();
  const baseUrl = getExplorerBaseUrl(explorer, resolvedNetwork);
  const paths = getExplorerPaths(explorer, resolvedNetwork);

  return `${baseUrl}${paths.contract}${contractId}`;
}

/**
 * Gets a list of available explorers.
 */
export function getAvailableExplorers(): string[] {
  return Object.keys(EXPLORERS);
}

/**
 * Gets the configuration for a specific explorer.
 */
export function getExplorerConfig(explorer: string): ExplorerConfig | null {
  return EXPLORERS[explorer] || null;
}

/**
 * Validates if a string is a valid Stellar account address (G-address).
 * Uses StrKey checksum validation from @stellar/stellar-sdk.
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return StrKey.isValidEd25519PublicKey(address.trim());
}

/**
 * Validates if a string is a valid Stellar transaction hash.
 * Transaction hashes are 64-character lowercase hex strings.
 */
export function isValidStellarTxHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") return false;
  return /^[a-f0-9]{64}$/i.test(hash.trim());
}

/**
 * Validates if a string is a valid Stellar/Soroban contract ID (C-address).
 * Uses StrKey checksum validation from @stellar/stellar-sdk.
 */
export function isValidStellarContractId(contractId: string): boolean {
  if (!contractId || typeof contractId !== "string") return false;
  return StrKey.isValidContract(contractId.trim());
}
