"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getSmartAccountKit,
  createSmartWallet as apiCreateWallet,
  connectWithPasskeyPrompt as apiConnectWithPasskeyPrompt,
  disconnectSmartWallet as apiDisconnectWallet,
  fetchSacTokenBalance,
} from "@/lib/smart-wallet/client";
import { WalletInfo } from "@/types/wallet";
import { toast } from "sonner";

interface SmartWalletContextType {
  walletInfo: WalletInfo | null;
  isConnected: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  registerSession: (userName: string) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SmartWalletContext = createContext<SmartWalletContextType | undefined>(
  undefined,
);

export function SmartWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        const registered =
          localStorage.getItem("bounties:passkey_registered") === "true";
        if (registered) setIsRegistered(true);

        const kit = await getSmartAccountKit();

        // Check if any credentials are pending deployment
        const pendingCreds = await kit.credentials.getAll();
        if (pendingCreds.length > 0) setIsRegistered(true);

        const result = await kit.connectWallet();
        if (result?.contractId) {
          localStorage.setItem("bounties:passkey_registered", "true");
          setIsRegistered(true);
          const balanceAmount = await fetchSacTokenBalance(result.contractId);

          setWalletInfo({
            address: result.contractId,
            displayName: "Smart Account User", // Replace with real username if stored
            balance: balanceAmount ? parseFloat(balanceAmount) : 0,
            balanceCurrency: "XLM",
            assets: [],
            recentActivity: [],
            has2FA: true, // Passkey inherent
            isConnected: true,
          });
          setIsConnected(true);
        }
      } catch (err) {
        console.warn("Silent re-connection failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const registerSession = async (userName: string) => {
    setIsLoading(true);
    try {
      const result = await apiCreateWallet(userName);

      const balanceAmount = await fetchSacTokenBalance(result.contractId);

      setWalletInfo({
        address: result.contractId,
        displayName: userName,
        balance: balanceAmount ? parseFloat(balanceAmount) : 0,
        balanceCurrency: "XLM",
        assets: [],
        recentActivity: [],
        has2FA: true,
        isConnected: true,
      });
      setIsConnected(true);
      setIsRegistered(true);
      localStorage.setItem("bounties:passkey_registered", "true");
      toast.success("Wallet created and connected successfully");
    } catch (err) {
      console.error(err);
      toast.error(
        `Failed to register passkey: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    try {
      // Use the improved flow that prompts for biometrics and discovers the contract
      const result = await apiConnectWithPasskeyPrompt();

      if (!result?.contractId) {
        throw new Error("No smart account found for this passkey.");
      }

      const balanceAmount = await fetchSacTokenBalance(result.contractId);

      setWalletInfo({
        address: result.contractId,
        displayName: "Smart Account User",
        balance: balanceAmount ? parseFloat(balanceAmount) : 0,
        balanceCurrency: "XLM",
        assets: [],
        recentActivity: [],
        has2FA: true,
        isConnected: true,
      });
      setIsConnected(true);
      setIsRegistered(true);
      localStorage.setItem("bounties:passkey_registered", "true");
      toast.success("Wallet connected via Passkey");
    } catch (err) {
      console.error(err);
      // Handle common WebAuthn errors gracefully
      if (
        err instanceof Error &&
        (err.name === "NotAllowedError" || err.name === "AbortError")
      ) {
        // User cancelled the prompt, no toast needed
      } else {
        toast.error(
          `Failed to connect wallet: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await apiDisconnectWallet();
      setWalletInfo(null);
      setIsConnected(false);
      toast.success("Wallet disconnected");
    } catch (err) {
      console.error(err);
      toast.error("Failed to disconnect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SmartWalletContext.Provider
      value={{
        walletInfo,
        isConnected,
        isRegistered,
        isLoading,
        registerSession,
        connect,
        disconnect,
      }}
    >
      {children}
    </SmartWalletContext.Provider>
  );
}

export function useSmartWallet() {
  const context = useContext(SmartWalletContext);
  if (context === undefined) {
    throw new Error("useSmartWallet must be used within a SmartWalletProvider");
  }
  return context;
}
