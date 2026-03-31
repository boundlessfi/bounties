"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchCommand } from "@/components/search-command";
import { NavRankBadge } from "@/components/leaderboard/nav-rank-badge";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { WalletSheet } from "@/components/wallet/wallet-sheet";
import { useSmartWallet } from "@/components/providers/smart-wallet-provider";
import { WalletInfo } from "@/types/wallet";
import { CreditBalance } from "@/components/reputation/credit-balance";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { SecureAccountStep } from "./onboarding/secure-account-step";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Wallet, LogIn, Fingerprint } from "lucide-react";

export function GlobalNavbar() {
  const pathname = usePathname();
  const { walletInfo, isConnected, isRegistered, connect, isLoading } =
    useSmartWallet();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Close dialog when connected
  useEffect(() => {
    if (isConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDialogOpen(false);
    }
  }, [isConnected]);

  const activeWalletInfo: WalletInfo = walletInfo || {
    address: "",
    displayName: "Not connected",
    balance: 0,
    balanceCurrency: "XLM",
    assets: [],
    recentActivity: [],
    has2FA: false,
    isConnected: false,
  };

  return (
    <nav className="border-b sticky top-0 z-50 w-full bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold pointer-events-auto"
          >
            <span className="text-xl tracking-tight">Bounties</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/bounty"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/bounty")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/projects"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/projects")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Projects
            </Link>
            <Link
              href="/leaderboard"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/leaderboard")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/transparency"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/transparency")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Transparency
            </Link>
            <Link
              href="/wallet"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/wallet")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Wallet
            </Link>
            <Link
              href="/bounty/review"
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith("/bounty/review")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Review
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavRankBadge userId="user-1" className="hidden sm:flex" />
          <CreditBalance userId="user-1" className="hidden sm:flex" />
          {/* TODO: Replace with actual auth user ID */}

          <NotificationCenter />

          {isConnected ? (
            <WalletSheet
              walletInfo={activeWalletInfo}
              trigger={
                <Button variant="outline" size="icon">
                  <Wallet className="h-4 w-4" />
                </Button>
              }
            />
          ) : (
            <div className="flex items-center gap-2">
              {isRegistered ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connect}
                  disabled={isLoading}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Setup Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Biometric Smart Wallet
                      </DialogTitle>
                    </DialogHeader>
                    <SecureAccountStep
                      onSuccess={() => setIsDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 ml-2 border-l pl-4">
            <SearchCommand />
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
