/**
 * TypeScript bindings for the Core Escrow Soroban smart contract.
 *
 * Generated pattern follows `stellar contract bindings typescript` output.
 * Contract: CA3VZVIMGLVG5EJF2ACB3LPMGQ6PID4TJTB3D2B3L6JIZRIS7NQPVPHN (Testnet)
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

export interface EscrowPool {
  id: string;
  bounty_id: string;
  total_amount: bigint;
  released_amount: bigint;
  status: string;
  token: string;
}

export interface DepositRecord {
  pool_id: string;
  depositor: string;
  amount: bigint;
  timestamp: bigint;
}

export interface PoolFundsArgs {
  bounty_id: string;
  token: string;
  total_amount: bigint;
}

export interface DepositArgs {
  pool_id: string;
  amount: bigint;
}

export interface ReleaseFundsArgs {
  pool_id: string;
  recipient: string;
  amount: bigint;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId:
      process.env.NEXT_PUBLIC_CORE_ESCROW_CONTRACT_ID ??
      "CA3VZVIMGLVG5EJF2ACB3LPMGQ6PID4TJTB3D2B3L6JIZRIS7NQPVPHN",
  },
} as const;

export class CoreEscrowClient {
  private readonly contract: Contract;
  readonly options: ContractClientOptions;

  constructor(options: ContractClientOptions) {
    this.options = options;
    this.contract = new Contract(options.contractId);
  }

  /**
   * Returns the ScVal args for `pool_funds`.
   * Creates a new escrow pool for a bounty.
   */
  poolFundsArgs(args: PoolFundsArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.bounty_id, { type: "string" }),
      nativeToScVal(args.token, { type: "address" }),
      nativeToScVal(args.total_amount, { type: "i128" }),
    ];
  }

  /**
   * Returns the ScVal args for `deposit`.
   * Deposits funds into an existing escrow pool.
   */
  depositArgs(args: DepositArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.pool_id, { type: "string" }),
      nativeToScVal(args.amount, { type: "i128" }),
    ];
  }

  /**
   * Returns the ScVal args for `release_funds`.
   * Releases escrowed funds to a recipient.
   */
  releaseFundsArgs(args: ReleaseFundsArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.pool_id, { type: "string" }),
      nativeToScVal(args.recipient, { type: "address" }),
      nativeToScVal(args.amount, { type: "i128" }),
    ];
  }

  /**
   * Returns the ScVal args for `get_pool` (read-only simulation).
   */
  getPoolArgs(poolId: string): xdr.ScVal[] {
    return [nativeToScVal(poolId, { type: "string" })];
  }

  /**
   * Returns the ScVal args for `get_pool_by_bounty` (read-only simulation).
   */
  getPoolByBountyArgs(bountyId: string): xdr.ScVal[] {
    return [nativeToScVal(bountyId, { type: "string" })];
  }

  /** Parses a raw `scVal` return into a typed `EscrowPool`. */
  parsePool(raw: xdr.ScVal): EscrowPool {
    return scValToNative(raw) as EscrowPool;
  }

  /** Parses a raw `scVal` return into a typed `DepositRecord`. */
  parseDeposit(raw: xdr.ScVal): DepositRecord {
    return scValToNative(raw) as DepositRecord;
  }

  /** Returns the underlying `Contract` instance for advanced use. */
  getContract(): Contract {
    return this.contract;
  }
}
