"use client";

import { useState } from "react";
import { WalletInfo } from "@/types/wallet";
import { truncateStellarAddress } from "@/lib/mock-wallet";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ShieldCheck, Calendar } from "lucide-react";

interface WalletOverviewProps {
    walletInfo: WalletInfo;
}

export function WalletOverview({ walletInfo }: WalletOverviewProps) {
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

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
                <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Account Information</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">Status</div>
                        <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Active & Secured
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Wallet Address</div>
                        <div className="flex items-center justify-between rounded-lg bg-muted p-2.5" title={walletInfo.address}>
                            <div className="truncate font-mono text-xs">
                                {truncateStellarAddress(walletInfo.address)}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyAddress}
                                className="h-8 w-8 shrink-0 ml-1"
                                title="Copy full address"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <ShieldCheck className="h-4 w-4 text-primary dark:text-primary fill-primary/10" />
                            <span>Abstracted Wallet</span>
                        </div>
                        <div className="text-xs text-muted-foreground italic">No setup required</div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Created</span>
                        </div>
                        <div className="text-sm font-medium">May 2024</div>
                    </div>
                </div>
            </div>

            <Button variant="outline" className="w-full text-xs" size="sm" asChild>
                <a href={`https://stellar.expert/explorer/public/account/${walletInfo.address}`} target="_blank" rel="noopener noreferrer">
                    View on Explorer
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
            </Button>
        </div>
    );
}
