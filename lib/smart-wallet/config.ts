import { Networks } from "@stellar/stellar-sdk";

const requireEnv = (name: string, fallback?: string) => {
  const value = process.env[name];
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || fallback || "";
};

export const SMART_WALLET_CONFIG = {
  rpcUrl: requireEnv(
    "NEXT_PUBLIC_STELLAR_RPC_URL",
    "https://soroban-testnet.stellar.org",
  ),
  networkPassphrase: requireEnv(
    "NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE",
    Networks.TESTNET,
  ),
  accountWasmHash: requireEnv(
    "NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH",
    "a12e8fa9621efd20315753bd4007d974390e31fbcb4a7ddc4dd0a0dec728bf2e",
  ),
  webauthnVerifierAddress: requireEnv(
    "NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS",
    "CBSHV66WG7UV6FQVUTB67P3DZUEJ2KJ5X6JKQH5MFRAAFNFJUAJVXJYV",
  ),
  nativeTokenContract: requireEnv(
    "NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT",
    "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  ),
  // Optional services
  indexerUrl: process.env.NEXT_PUBLIC_SMART_WALLET_INDEXER_URL || "",
  relayerUrl: process.env.NEXT_PUBLIC_SMART_WALLET_RELAYER_URL || "",
};
