"use client";

import { Button } from "@/components/ui/button";
import { AccountLink } from "@/components/ui/stellar-link";
import { getAccountUrl } from "@/lib/utils/stellar-explorer";
import { WalletInfo } from "@/types/wallet";
import { Calendar, ShieldCheck } from "lucide-react";

interface WalletOverviewProps {
  walletInfo: WalletInfo;
}

export function WalletOverview({ walletInfo }: WalletOverviewProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <div>
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
          Account Information
        </h3>

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
            <AccountLink
              value={walletInfo.address}
              maxLength={20}
              showCopy={true}
              className="font-mono text-xs w-full justify-between"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary dark:text-primary fill-primary/10" />
              <span>Abstracted Wallet</span>
            </div>
            <div className="text-xs text-muted-foreground italic">
              No setup required
            </div>
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
        <a
          href={getAccountUrl(walletInfo.address)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Explorer
        </a>
      </Button>
    </div>
  );
}
