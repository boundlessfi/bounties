"use client";

import { Suspense } from "react";
import { useSmartWallet } from "@/components/providers/smart-wallet-provider";
import { WalletOverview } from "@/components/wallet/wallet-overview";
import { BalanceCard } from "@/components/wallet/balance-card";
import { AssetsList } from "@/components/wallet/assets-list";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { WithdrawalSection } from "@/components/wallet/withdrawal-section";
import { SecuritySection } from "@/components/wallet/security-section";
import { EscrowSummary } from "@/components/wallet/escrow-summary";
import {
  useWalletAssets,
  useWalletTransactions,
  useEscrowSummary,
} from "@/hooks/use-wallet-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletInfo } from "@/types/wallet";
import { mockWalletWithAssets } from "@/lib/mock-wallet";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

function WalletConnectPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Connect your wallet</h2>
          <p className="text-muted-foreground max-w-sm">
            Connect your Stellar smart wallet to view your balances, assets, and
            transaction history.
          </p>
        </div>
        <Button size="lg" onClick={onConnect}>
          Connect with Passkey
        </Button>
      </div>
    </div>
  );
}

function WalletPageSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function DataErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function WalletPageContent() {
  const searchParams = useSearchParams();
  // Preview mode is only available in development to avoid bypassing auth in production.
  const isPreview =
    process.env.NODE_ENV === "development" &&
    searchParams.get("preview") === "1";

  const {
    walletInfo: providerInfo,
    isConnected,
    isLoading: walletLoading,
    connect,
  } = useSmartWallet();

  const walletAddress = providerInfo?.address ?? null;

  const {
    data: assets,
    isLoading: assetsLoading,
    isError: assetsError,
  } = useWalletAssets(walletAddress);
  const {
    data: activity,
    isLoading: activityLoading,
    isError: activityError,
  } = useWalletTransactions(walletAddress);
  const {
    data: escrow,
    isLoading: escrowLoading,
    isError: escrowError,
  } = useEscrowSummary(walletAddress);

  if (!isPreview && walletLoading) return <WalletPageSkeleton />;

  if (!isPreview && (!isConnected || !providerInfo)) {
    return <WalletConnectPrompt onConnect={connect} />;
  }

  // In preview mode without a connected wallet, fall back to mock data so the
  // page doesn't crash on the providerInfo spread below.
  const baseInfo = providerInfo ?? mockWalletWithAssets;

  const liveAssets = isPreview ? mockWalletWithAssets.assets : (assets ?? []);
  const totalBalanceUsd = isPreview
    ? mockWalletWithAssets.balance
    : liveAssets.reduce((sum, a) => sum + a.usdValue, 0);

  const walletInfo: WalletInfo = {
    ...baseInfo,
    balance: totalBalanceUsd,
    assets: liveAssets,
    recentActivity: isPreview
      ? mockWalletWithAssets.recentActivity
      : (activity ?? []),
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="flex flex-col gap-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your earnings, assets, and withdrawals.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 justify-items-center lg:justify-items-stretch">
        <div className="lg:col-span-2 space-y-8">
          <BalanceCard
            walletInfo={walletInfo}
            pendingEarnings={escrow?.totalLocked ?? 0}
            isLoading={!isPreview && assetsLoading}
          />

          {!isPreview && assetsError && (
            <DataErrorBanner message="Could not load balances. Check your connection and refresh." />
          )}

          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="space-y-4">
              {!isPreview && assetsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : (
                <AssetsList
                  assets={walletInfo.assets}
                  walletAddress={isPreview ? null : walletAddress}
                />
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              {!isPreview && activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  {!isPreview && activityError && (
                    <DataErrorBanner message="Could not load transaction history. Try refreshing the page." />
                  )}
                  <TransactionHistory activity={walletInfo.recentActivity} />
                </>
              )}
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <WithdrawalSection walletInfo={walletInfo} />
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <SecuritySection walletInfo={walletInfo} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <WalletOverview walletInfo={walletInfo} />

          <EscrowSummary
            data={escrow}
            isLoading={!isPreview && escrowLoading}
            isError={!isPreview && escrowError}
          />

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="grid gap-3">
              {/* TODO: Implement these routes */}
              <span className="text-sm text-muted-foreground cursor-not-allowed">
                How it works?
              </span>
              <span className="text-sm text-muted-foreground cursor-not-allowed">
                Fee Schedule
              </span>
              <span className="text-sm text-muted-foreground cursor-not-allowed">
                Support Center
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletPageSkeleton />}>
      <WalletPageContent />
    </Suspense>
  );
}
