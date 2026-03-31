/**
 * Soroban transaction helpers.
 *
 * Provides three core utilities:
 *  - `simulateContract<T>` — read-only query via RPC simulation
 *  - `buildTransaction`    — builds an unsigned transaction XDR for passkey signing
 *  - `submitTransaction`   — submits a signed XDR to the network
 */

import {
  Account,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  xdr,
  scValToNative,
} from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";

const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
  "https://soroban-testnet.stellar.org";

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
  Networks.TESTNET;

const DEFAULT_TIMEOUT_SECONDS = 30;

function getServer(): rpc.Server {
  return new rpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith("http://") });
}

/**
 * Simulates a read-only contract call and returns the typed result.
 *
 * @param contractId   - Strkey-encoded contract address
 * @param method       - Contract function name
 * @param args         - Encoded `xdr.ScVal` arguments
 * @param sourcePublicKey - Any funded Stellar account (used as transaction source)
 */
export async function simulateContract<T>(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourcePublicKey: string,
): Promise<T> {
  const server = getServer();
  const accountData = await server.getAccount(sourcePublicKey);
  const account = new Account(accountData.accountId(), accountData.sequenceNumber());

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(DEFAULT_TIMEOUT_SECONDS)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation error: ${simulation.error}`);
  }

  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw new Error("Simulation returned no result");
  }

  const retval = simulation.result?.retval;
  if (!retval) {
    throw new Error("No return value from contract simulation");
  }

  return scValToNative(retval) as T;
}

/**
 * Builds an unsigned Soroban transaction and returns its XDR string.
 *
 * The transaction is simulated first to populate the fee, resource limits,
 * and auth entries. The resulting XDR can be passed to a passkey signer.
 *
 * @param contractId      - Strkey-encoded contract address
 * @param method          - Contract function name
 * @param args            - Encoded `xdr.ScVal` arguments
 * @param sourcePublicKey - The Stellar account that will sign the transaction
 */
export async function buildTransaction(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourcePublicKey: string,
): Promise<string> {
  const server = getServer();
  const accountData = await server.getAccount(sourcePublicKey);
  const account = new Account(accountData.accountId(), accountData.sequenceNumber());

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(DEFAULT_TIMEOUT_SECONDS)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Transaction simulation error: ${simulation.error}`);
  }

  const assembled = rpc.assembleTransaction(tx, simulation).build();
  return assembled.toEnvelope().toXDR("base64");
}

/**
 * Submits a signed Soroban transaction to the network.
 *
 * @param signedXdr - Base64 XDR of the signed transaction envelope
 * @returns Transaction hash
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  const server = getServer();

  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sent = await server.sendTransaction(tx);

  if (sent.status === "ERROR") {
    const resultXdr = sent.errorResult?.toXDR("base64") ?? "unknown";
    throw new Error(`Transaction rejected by network. Result XDR: ${resultXdr}`);
  }

  return sent.hash;
}
