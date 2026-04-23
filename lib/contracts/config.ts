// NEXT_PUBLIC_* values are inlined at build time, so missing vars at build
// mean missing vars at runtime. Rather than crash the build (or the first SSR
// render after deploy), we fall back to testnet defaults and surface a loud
// console.error in production so the misconfiguration shows up in logs.
function resolveEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (typeof window === "undefined") {
    const logger =
      process.env.NODE_ENV === "production" ? console.error : console.warn;
    logger(
      `[stellar-config] ${name} is not set; falling back to default "${fallback}". ` +
        `Set this env var before deploying to production.`,
    );
  }
  return fallback;
}

export const STELLAR_RPC_URL = resolveEnv(
  "NEXT_PUBLIC_STELLAR_RPC_URL",
  "https://soroban-testnet.stellar.org",
);

export const STELLAR_EXPLORER_URL = resolveEnv(
  "NEXT_PUBLIC_STELLAR_EXPLORER_URL",
  "https://stellar.expert/explorer/testnet",
);

// Contract ID is optional at startup: its absence causes downstream code to
// return an "unknown" on-chain status instead of throwing, so the app can run
// before the contract is deployed.
export const BOUNTY_CONTRACT_ID =
  process.env.NEXT_PUBLIC_BOUNTY_CONTRACT_ID || "";
