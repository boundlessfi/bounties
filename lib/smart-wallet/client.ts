import {
  SmartAccountKit,
  IndexedDBStorage,
  StellarWalletsKitAdapter,
} from "smart-account-kit";
import { rpc, Asset } from "@stellar/stellar-sdk";
import { SMART_WALLET_CONFIG } from "./config";

// Singleton instance wrapper
let smartAccountKitInstance: SmartAccountKit | null = null;
let walletAdapterInstance: StellarWalletsKitAdapter | null = null;
let smartAccountKitInitPromise: Promise<SmartAccountKit> | null = null;
let walletAdapterInitPromise: Promise<StellarWalletsKitAdapter> | null = null;

export const getSmartAccountKit = async (): Promise<SmartAccountKit> => {
  if (smartAccountKitInstance) return smartAccountKitInstance;

  if (!smartAccountKitInitPromise) {
    smartAccountKitInitPromise = (async () => {
      try {
        if (!walletAdapterInitPromise) {
          walletAdapterInitPromise = (async () => {
            const adapter = new StellarWalletsKitAdapter({
              network: SMART_WALLET_CONFIG.networkPassphrase,
            });
            await adapter.init();
            return adapter;
          })();
        }
        walletAdapterInstance = await walletAdapterInitPromise;

        const kit = new SmartAccountKit({
          rpcUrl: SMART_WALLET_CONFIG.rpcUrl,
          networkPassphrase: SMART_WALLET_CONFIG.networkPassphrase,
          accountWasmHash: SMART_WALLET_CONFIG.accountWasmHash,
          webauthnVerifierAddress: SMART_WALLET_CONFIG.webauthnVerifierAddress,
          storage: new IndexedDBStorage(),
          rpName: "Bounties Application",
          externalWallet: walletAdapterInstance,
          relayerUrl: SMART_WALLET_CONFIG.relayerUrl || undefined,
        });
        smartAccountKitInstance = kit;
        return kit;
      } catch (error) {
        smartAccountKitInitPromise = null;
        walletAdapterInitPromise = null;
        throw error;
      }
    })();
  }
  return await smartAccountKitInitPromise;
};

// Returns { contractId, credentialId, submitResult }
export const createSmartWallet = async (userName: string) => {
  const kit = await getSmartAccountKit();

  const result = await kit.createWallet("Bounties Smart Account", userName, {
    autoSubmit: true,
  });

  if (!result.submitResult || !result.submitResult.success) {
    const errorMsg = result.submitResult?.error || "Unknown deployment error";
    throw new Error(`Deployment failed: ${errorMsg}`);
  }

  return {
    contractId: result.contractId,
    credentialId: result.credentialId,
    hash: result.submitResult.hash,
  };
};

export const connectSmartWallet = async (options?: {
  contractId?: string;
  credentialId?: string;
}) => {
  const kit = await getSmartAccountKit();
  // If options are provided, it attempts a specific connection.
  // If not, it attempts a silent restore from storage.
  const result = await kit.connectWallet(options);
  return result;
};

// New: Robust connection flow that prompts for passkey and discovers contracts
export const connectWithPasskeyPrompt = async () => {
  const kit = await getSmartAccountKit();

  // Step 1: Physical biometric prompt to identify the user
  const { credentialId } = await kit.authenticatePasskey();

  // Step 2: Try to discover existing contracts for this passkey via indexer
  const contracts = await kit.discoverContractsByCredential(credentialId);

  let contractId: string | undefined;

  if (contracts && contracts.length > 0) {
    // If multiple contracts found, you'd ideally show a picker.
    // For this implementation, we take the first one found.
    contractId = contracts[0].contract_id;
  }

  // Step 3: Connect to the identified (or derived) contract
  return await kit.connectWallet({ contractId, credentialId });
};

export const disconnectSmartWallet = async () => {
  if (smartAccountKitInstance) {
    await smartAccountKitInstance.disconnect();
  }
};

export const transfer = async (
  tokenContract: string,
  recipient: string,
  amount: number,
) => {
  const kit = await getSmartAccountKit();
  const result = await kit.transfer(tokenContract, recipient, amount);
  if (!result.success) {
    throw new Error(result.error || "Transfer failed");
  }
  return result;
};

export const fetchSacTokenBalance = async (
  walletContractId: string,
  tokenContract?: string,
) => {
  try {
    const server = new rpc.Server(SMART_WALLET_CONFIG.rpcUrl);
    // STROOPS_PER_XLM is 10000000
    const STROOPS_PER_XLM = 10000000;

    const asset =
      tokenContract && tokenContract !== SMART_WALLET_CONFIG.nativeTokenContract
        ? new Asset("XLM", "") // This is a placeholder for how you'd construct a non-native asset if tokenContract is an address
        : Asset.native();

    // Note: getSACBalance is a specialized helper for Soroban-token-wrapped balances.
    const result = await server.getSACBalance(
      walletContractId,
      asset,
      SMART_WALLET_CONFIG.networkPassphrase,
    );
    if (result.balanceEntry) {
      return (Number(result.balanceEntry.amount) / STROOPS_PER_XLM).toFixed(2);
    }
    return "0.00";
  } catch (error) {
    console.warn("Failed to fetch SAC token balance:", error);
    return null;
  }
};
