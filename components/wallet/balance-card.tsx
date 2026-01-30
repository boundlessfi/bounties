"use client";

import { WalletInfo } from "@/types/wallet";
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BalanceCardProps {
    walletInfo: WalletInfo;
}

export function BalanceCard({ walletInfo }: BalanceCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    // Mock data for breakdown
    const pendingEarnings = 150.00;
    const availableForWithdrawal = walletInfo.balance;
    const change24h = 12.5;

    return (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                    <h2 className="text-5xl font-bold tracking-tight">
                        {formatCurrency(walletInfo.balance + pendingEarnings)}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`flex items-center gap-0.5 text-sm font-medium ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            {Math.abs(change24h)}%
                        </div>
                        <span className="text-xs text-muted-foreground">past 24h</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 md:text-right">
                    <div className="space-y-1">
                        <div className="flex items-center md:justify-end gap-1.5 text-sm text-muted-foreground">
                            Available now
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3.5 w-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>Funds ready for withdrawal or transfer</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-xl font-semibold">{formatCurrency(availableForWithdrawal)}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center md:justify-end gap-1.5 text-sm text-muted-foreground">
                            Pending
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3.5 w-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>Earnings awaiting network or platform confirmation</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className="text-xl font-semibold text-muted-foreground">
                            {formatCurrency(pendingEarnings)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                {walletInfo.assets.map((asset) => (
                    <div key={asset.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary-foreground dark:text-primary shrink-0 transition-colors">
                            {asset.tokenSymbol}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{asset.amount.toLocaleString()} {asset.tokenSymbol}</p>
                            <p className="text-[10px] text-muted-foreground">{formatCurrency(asset.usdValue)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
