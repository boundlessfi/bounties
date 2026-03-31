import { contract } from "@stellar/stellar-sdk";
import { getSmartAccountKit } from "./client";

export const signAndSubmit = async <T>(
  transaction: contract.AssembledTransaction<T>,
) => {
  const kit = await getSmartAccountKit();

  try {
    // Note: SmartAccountKit v0.2.10 provides signAndSubmit which
    // handles re-simulation and submission for passkey authorization.
    return await kit.signAndSubmit(transaction);
  } catch (error) {
    console.error("Error in signAndSubmit:", error);
    throw error;
  }
};
