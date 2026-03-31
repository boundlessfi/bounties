/**
 * TypeScript bindings for the Bounty Registry Soroban smart contract.
 *
 * Generated pattern follows `stellar contract bindings typescript` output.
 * Contract: CBWXIV3DERH4GKADOTEEI2QADGZAMMJT4T2B5LFVZULGHEP5BACK2TLY (Testnet)
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

export interface BountyData {
  id: string;
  title: string;
  description: string;
  reward: bigint;
  deadline: bigint;
  status: string;
  creator: string;
  tags: string[];
}

export interface ApplicationData {
  id: string;
  bounty_id: string;
  applicant: string;
  proposal: string;
  status: string;
  created_at: bigint;
}

export interface CreateBountyArgs {
  title: string;
  description: string;
  reward: bigint;
  deadline: bigint;
  tags: string[];
}

export interface UpdateBountyArgs {
  bounty_id: string;
  title?: string;
  description?: string;
  reward?: bigint;
  deadline?: bigint;
}

export interface ApplyToBountyArgs {
  bounty_id: string;
  proposal: string;
}

export interface ListBountiesArgs {
  status?: string;
  creator?: string;
  limit?: number;
  offset?: number;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId:
      process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_CONTRACT_ID ??
      "CBWXIV3DERH4GKADOTEEI2QADGZAMMJT4T2B5LFVZULGHEP5BACK2TLY",
  },
} as const;

export class BountyRegistryClient {
  private readonly contract: Contract;
  readonly options: ContractClientOptions;

  constructor(options: ContractClientOptions) {
    this.options = options;
    this.contract = new Contract(options.contractId);
  }

  /**
   * Returns the ScVal args for `create_bounty`.
   * Used by transaction helpers to build unsigned XDR.
   */
  createBountyArgs(args: CreateBountyArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.title, { type: "string" }),
      nativeToScVal(args.description, { type: "string" }),
      nativeToScVal(args.reward, { type: "i128" }),
      nativeToScVal(args.deadline, { type: "u64" }),
      nativeToScVal(args.tags, { type: "vec" }),
    ];
  }

  /**
   * Returns the ScVal args for `update_bounty`.
   */
  updateBountyArgs(args: UpdateBountyArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.bounty_id, { type: "string" }),
      nativeToScVal(args.title ?? null),
      nativeToScVal(args.description ?? null),
      nativeToScVal(args.reward ?? null),
      nativeToScVal(args.deadline ?? null),
    ];
  }

  /**
   * Returns the ScVal args for `close_bounty`.
   */
  closeBountyArgs(bountyId: string): xdr.ScVal[] {
    return [nativeToScVal(bountyId, { type: "string" })];
  }

  /**
   * Returns the ScVal args for `apply_to_bounty`.
   */
  applyToBountyArgs(args: ApplyToBountyArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.bounty_id, { type: "string" }),
      nativeToScVal(args.proposal, { type: "string" }),
    ];
  }

  /**
   * Returns the ScVal args for `get_bounty` (read-only simulation).
   */
  getBountyArgs(bountyId: string): xdr.ScVal[] {
    return [nativeToScVal(bountyId, { type: "string" })];
  }

  /**
   * Returns the ScVal args for `list_bounties` (read-only simulation).
   */
  listBountiesArgs(args: ListBountiesArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.status ?? null),
      nativeToScVal(args.creator ?? null),
      nativeToScVal(args.limit ?? 20, { type: "u32" }),
      nativeToScVal(args.offset ?? 0, { type: "u32" }),
    ];
  }

  /**
   * Returns the ScVal args for `get_application` (read-only simulation).
   */
  getApplicationArgs(applicationId: string): xdr.ScVal[] {
    return [nativeToScVal(applicationId, { type: "string" })];
  }

  /**
   * Parses a raw `scVal` return into a typed `BountyData`.
   */
  parseBounty(raw: xdr.ScVal): BountyData {
    return scValToNative(raw) as BountyData;
  }

  /**
   * Parses a raw `scVal` return into a typed `ApplicationData`.
   */
  parseApplication(raw: xdr.ScVal): ApplicationData {
    return scValToNative(raw) as ApplicationData;
  }

  /**
   * Parses a raw `scVal` return into a typed `BountyData[]`.
   */
  parseBounties(raw: xdr.ScVal): BountyData[] {
    return scValToNative(raw) as BountyData[];
  }

  /** Returns the underlying `Contract` instance for advanced use. */
  getContract(): Contract {
    return this.contract;
  }
}
