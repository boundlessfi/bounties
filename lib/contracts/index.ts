/**
 * Configured Soroban contract clients.
 *
 * Each client is instantiated with contract addresses and network settings
 * sourced from environment variables, falling back to Testnet defaults.
 *
 * Usage:
 *   import { bountyRegistry, coreEscrow, reputationRegistry, projectRegistry } from "@/lib/contracts";
 *   import { simulateContract, buildTransaction } from "@/lib/contracts";
 */

import { Networks } from "@stellar/stellar-sdk";

import { BountyRegistryClient } from "./bounty-registry";
import { CoreEscrowClient } from "./core-escrow";
import { ProjectRegistryClient } from "./project-registry";
import { ReputationRegistryClient } from "./reputation-registry";

const networkPassphrase =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;

const rpcUrl =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
  "https://soroban-testnet.stellar.org";

const sharedOptions = { networkPassphrase, rpcUrl };

/** Pre-configured Bounty Registry client (testnet by default). */
export const bountyRegistry = new BountyRegistryClient({
  contractId:
    process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_CONTRACT_ID ??
    "CBWXIV3DERH4GKADOTEEI2QADGZAMMJT4T2B5LFVZULGHEP5BACK2TLY",
  ...sharedOptions,
});

/** Pre-configured Core Escrow client (testnet by default). */
export const coreEscrow = new CoreEscrowClient({
  contractId:
    process.env.NEXT_PUBLIC_CORE_ESCROW_CONTRACT_ID ??
    "CA3VZVIMGLVG5EJF2ACB3LPMGQ6PID4TJTB3D2B3L6JIZRIS7NQPVPHN",
  ...sharedOptions,
});

/** Pre-configured Reputation Registry client (testnet by default). */
export const reputationRegistry = new ReputationRegistryClient({
  contractId:
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_CONTRACT_ID ??
    "CBVQEDH4T5KOJQSESL2HEFI2YZWXPSZQ5TASKRNWAVZFIWAKEU74RFF4",
  ...sharedOptions,
});

/** Pre-configured Project Registry client (testnet by default). */
export const projectRegistry = new ProjectRegistryClient({
  contractId:
    process.env.NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT_ID ??
    "CCG4QM2GZKBN7GBRAE3PFNE3GM2B6QRS7FOKLHGV2FT2HHETIS7JUVYT",
  ...sharedOptions,
});

// Re-export transaction helpers for convenience.
export { buildTransaction, simulateContract, submitTransaction } from "./transaction";

// Re-export all client classes and their types.
export { BountyRegistryClient } from "./bounty-registry";
export type {
  ApplicationData,
  ApplyToBountyArgs,
  BountyData,
  CreateBountyArgs,
  ListBountiesArgs,
  UpdateBountyArgs,
} from "./bounty-registry";

export { CoreEscrowClient } from "./core-escrow";
export type {
  DepositArgs,
  DepositRecord,
  EscrowPool,
  PoolFundsArgs,
  ReleaseFundsArgs,
} from "./core-escrow";

export { ReputationRegistryClient } from "./reputation-registry";
export type {
  CreditReputationArgs,
  ReputationEvent,
  ReputationProfile,
} from "./reputation-registry";

export { ProjectRegistryClient } from "./project-registry";
export type {
  AddMaintainerArgs,
  CreateProjectArgs,
  ProjectData,
  UpdateProjectArgs,
} from "./project-registry";
