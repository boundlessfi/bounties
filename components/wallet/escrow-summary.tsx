"use client";

import { Lock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EscrowSummaryData } from "@/hooks/use-wallet-data";

interface EscrowSummaryProps {
  data: EscrowSummaryData | undefined;
  isLoading: boolean;
  isError?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );

export function EscrowSummary({
  data,
  isLoading,
  isError,
}: EscrowSummaryProps) {
  const totalLocked = data?.totalLocked ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-amber-500" />
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Escrow Locked
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Could not load escrow data.</span>
        </div>
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(totalLocked)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalLocked > 0
                ? "Funds locked in your active bounty escrows"
                : "No escrow funds locked for this wallet"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
