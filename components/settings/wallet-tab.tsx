"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, LogOut, Wallet } from "lucide-react";
import { useSmartWallet } from "@/components/providers/smart-wallet-provider";
import { AccountLink } from "@/components/ui/stellar-link";

export function WalletTab() {
  const { walletInfo, isConnected, isLoading, disconnect } = useSmartWallet();
  const [confirming, setConfirming] = useState(false);

  const handleDisconnect = async () => {
    setConfirming(false);
    await disconnect();
  };

  if (!isConnected || !walletInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <p className="font-medium">No wallet connected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect a wallet from the navigation bar to manage it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Connected</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Wallet Address</p>
          <AccountLink
            value={walletInfo.address}
            maxLength={20}
            showCopy
            className="font-mono text-sm rounded-md bg-muted/50 px-3 py-2 border border-border w-full justify-between"
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-lg font-semibold">
            {walletInfo.balance.toLocaleString()} {walletInfo.balanceCurrency}
          </p>
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              Your wallet will be disconnected from this session. You can
              reconnect at any time using your passkey.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
