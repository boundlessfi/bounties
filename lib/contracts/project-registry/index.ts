/**
 * TypeScript bindings for the Project Registry Soroban smart contract.
 *
 * Generated pattern follows `stellar contract bindings typescript` output.
 * Contract: CCG4QM2GZKBN7GBRAE3PFNE3GM2B6QRS7FOKLHGV2FT2HHETIS7JUVYT (Testnet)
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

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  owner: string;
  maintainers: string[];
  repository: string;
  status: string;
  created_at: bigint;
}

export interface CreateProjectArgs {
  name: string;
  description: string;
  repository: string;
  maintainers: string[]; // addresses
}

export interface UpdateProjectArgs {
  project_id: string;
  name?: string;
  description?: string;
  repository?: string;
}

export interface AddMaintainerArgs {
  project_id: string;
  maintainer: string; // address
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId:
      process.env.NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT_ID ??
      "CCG4QM2GZKBN7GBRAE3PFNE3GM2B6QRS7FOKLHGV2FT2HHETIS7JUVYT",
  },
} as const;

export class ProjectRegistryClient {
  private readonly contract: Contract;
  readonly options: ContractClientOptions;

  constructor(options: ContractClientOptions) {
    this.options = options;
    this.contract = new Contract(options.contractId);
  }

  /**
   * Returns the ScVal args for `create_project`.
   */
  createProjectArgs(args: CreateProjectArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.name, { type: "string" }),
      nativeToScVal(args.description, { type: "string" }),
      nativeToScVal(args.repository, { type: "string" }),
      nativeToScVal(args.maintainers, {
        type: "vec",
        elementType: "address",
      } as unknown as { type: string }),
    ];
  }

  /**
   * Returns the ScVal args for `update_project`.
   */
  updateProjectArgs(args: UpdateProjectArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.project_id, { type: "string" }),
      nativeToScVal(args.name ?? null),
      nativeToScVal(args.description ?? null),
      nativeToScVal(args.repository ?? null),
    ];
  }

  /**
   * Returns the ScVal args for `add_maintainer`.
   */
  addMaintainerArgs(args: AddMaintainerArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.project_id, { type: "string" }),
      nativeToScVal(args.maintainer, { type: "address" }),
    ];
  }

  /**
   * Returns the ScVal args for `get_project` (read-only simulation).
   */
  getProjectArgs(projectId: string): xdr.ScVal[] {
    return [nativeToScVal(projectId, { type: "string" })];
  }

  /**
   * Returns the ScVal args for `list_projects` (read-only simulation).
   */
  listProjectsArgs(owner?: string, limit: number = 20): xdr.ScVal[] {
    return [
      nativeToScVal(owner ?? null),
      nativeToScVal(limit, { type: "u32" }),
    ];
  }

  /** Parses a raw `scVal` return into a typed `ProjectData`. */
  parseProject(raw: xdr.ScVal): ProjectData {
    return scValToNative(raw) as ProjectData;
  }

  /** Parses a raw `scVal` return into a typed `ProjectData[]`. */
  parseProjects(raw: xdr.ScVal): ProjectData[] {
    return scValToNative(raw) as ProjectData[];
  }

  /** Returns the underlying `Contract` instance for advanced use. */
  getContract(): Contract {
    return this.contract;
  }
}
