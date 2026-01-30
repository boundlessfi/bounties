"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Wallet,
    Copy,
    Check,
    Shield,
    ExternalLink,
    ArrowUpRight,
    ArrowDownLeft,
} from "lucide-react";
import { WalletInfo } from "@/types/wallet";
import { truncateStellarAddress } from "@/lib/mock-wallet";
import { formatDistanceToNow } from "date-fns";

interface WalletSheetProps {
    walletInfo: WalletInfo;
    trigger?: React.ReactNode;
}

export function WalletSheet({ walletInfo, trigger }: WalletSheetProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(walletInfo.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy address:", error);
        }
    };

    const formatCurrency = (amount: number, currency: string = "USD") => {
        if (currency === "USD") {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount);
        }
        return `${amount.toLocaleString()} ${currency}`;
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="icon">
                        <Wallet className="h-4 w-4" />
                    </Button>
                )}
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-popover text-popover-foreground px-6">
                <SheetHeader className="space-y-4">
                    <SheetTitle className="text-left">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Wallet</div>
                                <div className="text-lg font-semibold">
                                    {walletInfo.displayName}
                                </div>
                            </div>

                            {walletInfo.isConnected && (
                                <div className="flex items-center gap-1 text-xs text-green-500">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    Connected
                                </div>
                            )}
                        </div>
                    </SheetTitle>

                    {/* Address */}
                    <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 text-xs text-muted-foreground">Address</div>
                            <div className="truncate font-mono text-sm">
                                {truncateStellarAddress(walletInfo.address)}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyAddress}
                            className="ml-2 shrink-0"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Balance */}
                    <div className="rounded-xl border border-border bg-card py-6 text-center">
                        <div className="mb-1 text-4xl font-bold">
                            {formatCurrency(
                                walletInfo.balance,
                                walletInfo.balanceCurrency
                            )}
                        </div>
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                            Balance
                        </div>
                    </div>

                    {/* 2FA Prompt */}
                    {!walletInfo.has2FA && (
                        <>
                            <Separator />
                            <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 text-sm font-medium">
                                        Add Two Factor Authentication
                                    </div>
                                    <div className="mb-2 text-xs text-muted-foreground">
                                        Secure your wallet with 2FA
                                    </div>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-xs text-primary dark:text-primary"
                                        asChild
                                    >
                                        <Link href="/wallet">
                                            Go to Security Settings
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {walletInfo.has2FA && (
                        <>
                            <Separator />
                            <div className="flex items-center gap-2 text-sm text-green-500">
                                <Check className="h-4 w-4" />
                                Two-factor authentication enabled
                            </div>
                        </>
                    )}

                    {/* Assets */}
                    <Separator />
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold">Assets</h3>
                            {walletInfo.assets.length > 0 && (
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-xs text-primary"
                                    asChild
                                >
                                    <Link href="/wallet">
                                        View More
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {walletInfo.assets.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Wallet className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                                <div className="mb-1 text-sm font-medium">
                                    Your wallet is empty
                                </div>
                                <div className="mx-auto max-w-xs text-xs text-muted-foreground">
                                    Your rewards will appear here once you get paid.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {walletInfo.assets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="flex items-center justify-between rounded-lg bg-muted p-3 transition-colors hover:bg-muted/70"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-foreground dark:text-primary">
                                                {asset.tokenSymbol[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {asset.tokenSymbol}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {asset.tokenName}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {asset.amount.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatCurrency(asset.usdValue)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activity */}
                    <Separator />
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold">Activity</h3>
                            {walletInfo.recentActivity.length > 0 && (
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-xs text-primary dark:text-primary"
                                    asChild
                                >
                                    <Link href="/wallet">
                                        View More
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {walletInfo.recentActivity.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <ArrowUpRight className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <div className="mb-1 text-sm font-medium">
                                    No activity yet
                                </div>
                                <div className="mx-auto max-w-xs text-xs text-muted-foreground">
                                    Earnings and withdrawals will appear here.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {walletInfo.recentActivity.slice(0, 5).map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between rounded-lg bg-muted p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${activity.type === "earning"
                                                    ? "bg-green-500/10"
                                                    : "bg-orange-500/10"
                                                    }`}
                                            >
                                                {activity.type === "earning" ? (
                                                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-orange-500" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium capitalize">
                                                    {activity.type}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(activity.date), {
                                                        addSuffix: true,
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div
                                                className={`text-sm font-medium ${activity.type === "earning" ? "text-green-500" : ""
                                                    }`}
                                            >
                                                {activity.type === "earning" ? "+" : "-"}
                                                {formatCurrency(activity.amount, activity.currency)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {activity.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <Separator />
                    <div className="pb-4 text-center text-xs text-muted-foreground">
                        Have questions?{" "}
                        <a
                            href="mailto:support@boundlessfi.xyz"
                            className="text-primary hover:underline"
                        >
                            support@boundlessfi.xyz
                        </a>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
