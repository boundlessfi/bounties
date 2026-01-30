"use client";

import { WalletOverview } from "@/components/wallet/wallet-overview";
import { BalanceCard } from "@/components/wallet/balance-card";
import { AssetsList } from "@/components/wallet/assets-list";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { WithdrawalSection } from "@/components/wallet/withdrawal-section";
import { SecuritySection } from "@/components/wallet/security-section";
import { mockWalletWithAssets } from "@/lib/mock-wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WalletPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
                <p className="text-muted-foreground">
                    Manage your earnings, assets, and withdrawals.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <BalanceCard walletInfo={mockWalletWithAssets} />

                    <Tabs defaultValue="assets" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="assets">Assets</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="assets" className="space-y-4">
                            <AssetsList assets={mockWalletWithAssets.assets} />
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                            <TransactionHistory activity={mockWalletWithAssets.recentActivity} />
                        </TabsContent>

                        <TabsContent value="withdraw" className="space-y-4">
                            <WithdrawalSection walletInfo={mockWalletWithAssets} />
                        </TabsContent>

                        <TabsContent value="security" className="space-y-4">
                            <SecuritySection walletInfo={mockWalletWithAssets} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-8">
                    <WalletOverview walletInfo={mockWalletWithAssets} />

                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <div className="grid gap-3">
                            {/* TODO: Implement these routes */}
                            <span className="text-sm text-muted-foreground cursor-not-allowed">How it works?</span>
                            <span className="text-sm text-muted-foreground cursor-not-allowed">Fee Schedule</span>
                            <span className="text-sm text-muted-foreground cursor-not-allowed">Support Center</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
