"use client";

import React, { useState } from "react";
import { useSmartWallet } from "../providers/smart-wallet-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, ShieldAlert, Fingerprint, Loader2 } from "lucide-react";

interface SecureAccountStepProps {
  onSuccess?: () => void;
}

export function SecureAccountStep({ onSuccess }: SecureAccountStepProps) {
  const { registerSession, isConnected, walletInfo } = useSmartWallet();
  const [userName, setUserName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "deploying" | "success">("form");

  // Check if WebAuthn is available in the browser
  const isWebAuthnSupported =
    typeof window !== "undefined" && window.PublicKeyCredential !== undefined;

  const handleCreateAccount = async () => {
    if (!userName.trim()) {
      setError("Please provide an account name.");
      return;
    }

    try {
      setIsRegistering(true);
      setError(null);
      setStep("deploying");

      // Registers passkey and deploys the Smart Wallet
      await registerSession(userName);

      // Assume walletInfo will eventually have the address, but since it's asynchronous
      // We will perform initialization directly in the background or use the generated address if returned.
      // But provider handles it, so we can just wait a tick or just display success.
      setStep("success");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create smart wallet with passkey.",
      );
      setStep("form");
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isWebAuthnSupported) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-6 h-6" />
            <CardTitle>Biometrics Not Supported</CardTitle>
          </div>
          <CardDescription>
            Your current browser or device does not support WebAuthn passkeys.
            Please try a different device or browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (step === "success" && isConnected && walletInfo?.address) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 border-green-500/30">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center text-green-500 mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardTitle>Smart Account Secured</CardTitle>
          <CardDescription>
            Your smart wallet has been safely deployed and linked to your
            biometrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase mb-1">
              Stellar Address
            </span>
            <span className="text-sm font-mono break-all text-center">
              {walletInfo?.address}
            </span>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            On-chain reputation capability enabled. You can now use your
            biometric passkey to sign bounties.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/bounty">Continue Exploring</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Secure Account</CardTitle>
        <CardDescription>
          We use device passkeys & biometrics to securely create your on-chain
          Smart Wallet. No passwords to remember.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "deploying" ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-center font-medium animate-pulse">
              Requesting biometrics & deploying Smart Account...
              <br />
              <span className="text-xs text-muted-foreground font-normal">
                This might take a few seconds on Stellar testnet.
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none"
              >
                Account Nickname
              </label>
              <Input
                id="name"
                placeholder="e.g. John's MacBook"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isRegistering}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
      {step === "form" && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleCreateAccount}
            disabled={isRegistering || !userName.trim()}
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            Create Passkey Wallet
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
