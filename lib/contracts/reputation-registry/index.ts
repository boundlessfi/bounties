/**
 * TypeScript bindings for the Reputation Registry Soroban smart contract.
 *
 * Generated pattern follows `stellar contract bindings typescript` output.
 * Contract: CBVQEDH4T5KOJQSESL2HEFI2YZWXPSZQ5TASKRNWAVZFIWAKEU74RFF4 (Testnet)
 */

import {
  Contract,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

export interface ContractClientOptions {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
}

export interface ReputationProfile {
  address: string;
  score: bigint;
  tier: string;
  completed_bounties: number;
  total_earned: bigint;
  streak: number;
  last_activity: bigint;
}

export interface ReputationEvent {
  address: string;
  delta: bigint;
  reason: string;
  bounty_id?: string;
  timestamp: bigint;
}

export interface CreditReputationArgs {
  address: string;
  delta: bigint;
  reason: string;
  bounty_id?: string;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId:
      process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_CONTRACT_ID ??
      "CBVQEDH4T5KOJQSESL2HEFI2YZWXPSZQ5TASKRNWAVZFIWAKEU74RFF4",
  },
} as const;

export class ReputationRegistryClient {
  private readonly contract: Contract;
  readonly options: ContractClientOptions;

  constructor(options: ContractClientOptions) {
    this.options = options;
    this.contract = new Contract(options.contractId);
  }

  /**
   * Returns the ScVal args for `credit_reputation`.
   * Adjusts the reputation score for a given address.
   */
  creditReputationArgs(args: CreditReputationArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.address, { type: "address" }),
      nativeToScVal(args.delta, { type: "i128" }),
      nativeToScVal(args.reason, { type: "string" }),
      nativeToScVal(args.bounty_id ?? null),
    ];
  }

  /**
   * Returns the ScVal args for `get_profile` (read-only simulation).
   */
  getProfileArgs(address: string): xdr.ScVal[] {
    return [nativeToScVal(address, { type: "address" })];
  }

  /**
   * Returns the ScVal args for `get_history` (read-only simulation).
   */
  getHistoryArgs(address: string, limit: number = 20): xdr.ScVal[] {
    return [
      nativeToScVal(address, { type: "address" }),
      nativeToScVal(limit, { type: "u32" }),
    ];
  }

  /**
   * Returns the ScVal args for `get_leaderboard` (read-only simulation).
   */
  getLeaderboardArgs(limit: number = 50): xdr.ScVal[] {
    return [nativeToScVal(limit, { type: "u32" })];
  }

  /** Parses a raw `scVal` return into a typed `ReputationProfile`. */
  parseProfile(raw: xdr.ScVal): ReputationProfile {
    return scValToNative(raw) as ReputationProfile;
  }

  /** Parses a raw `scVal` return into a typed `ReputationEvent[]`. */
  parseHistory(raw: xdr.ScVal): ReputationEvent[] {
    return scValToNative(raw) as ReputationEvent[];
  }

  /** Parses a raw `scVal` return into a typed `ReputationProfile[]`. */
  parseLeaderboard(raw: xdr.ScVal): ReputationProfile[] {
    return scValToNative(raw) as ReputationProfile[];
  }

  /** Returns the underlying `Contract` instance for advanced use. */
  getContract(): Contract {
    return this.contract;
  }
}
