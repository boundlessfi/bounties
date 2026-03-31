"use client";

import { useCancellation } from "@/hooks/use-escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import type { RefundStatus } from "@/types/escrow";

interface RefundStatusTrackerProps {
  bountyId: string;
  /** Only fetch when bounty is actually cancelled */
  isCancelled: boolean;
}

const STATUS_CONFIG: Record<
  RefundStatus,
  {
    icon: React.ElementType;
    label: string;
    colorClass: string;
    bgClass: string;
  }
> = {
  pending: {
    icon: Clock,
    label: "Pending",
    colorClass: "text-yellow-400",
    bgClass: "bg-yellow-500/10 border-yellow-500/20",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10 border-blue-500/20",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    colorClass: "text-red-400",
    bgClass: "bg-red-500/10 border-red-500/20",
  },
};

export function RefundStatusTracker({
  bountyId,
  isCancelled,
}: RefundStatusTrackerProps) {
  const { data: cancellation, isLoading } = useCancellation(
    bountyId,
    isCancelled,
  );
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isCancelled) return null;

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-background-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading refund status…
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!cancellation) {
    return (
      <Card className="border-border/50 bg-background-card overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Bounty Cancelled</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            This bounty was cancelled. Detailed refund and cancellation
            information is currently unavailable.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!cancellation.refund) {
    return (
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-base">Refund Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This bounty was cancelled. Refund is being processed by the escrow
            contract.
          </p>
          {cancellation.reason && (
            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                Cancellation Reason
              </p>
              <p className="text-sm text-foreground">{cancellation.reason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const { refund } = cancellation;
  const config = STATUS_CONFIG[refund.status];
  const StatusIcon = config.icon;

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(refund.transactionHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch (err) {
      console.error("Failed to copy hash:", err);
      toast.error("Failed to copy transaction hash");
      setCopiedHash(false);
    }
  };

  const truncateHash = (hash: string) =>
    `${hash.slice(0, 8)}…${hash.slice(-8)}`;

  return (
    <Card className="border-border/50 bg-background-card overflow-hidden">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-red-400" />
            <CardTitle className="text-base">Refund Status</CardTitle>
          </div>
          <Badge
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 border ${config.bgClass} ${config.colorClass}`}
          >
            <StatusIcon
              className={`h-3 w-3 ${config.colorClass} ${
                refund.status === "processing" ? "animate-spin" : ""
              }`}
            />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Refund summary grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x border-b">
          <div className="p-5 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">
              Amount Refunded
            </span>
            <div className="text-2xl font-bold flex items-baseline gap-1">
              {refund.refundedAmount.toLocaleString()}
              <span className="text-sm font-medium text-muted-foreground">
                {refund.asset}
              </span>
            </div>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">
              Refund Date
            </span>
            <p className="text-sm font-medium text-foreground">
              {format(new Date(refund.timestamp), "PPP 'at' p")}
            </p>
          </div>
        </div>

        {/* Transaction hash */}
        <div className="p-5 border-b">
          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
            Transaction Hash
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
            <code className="text-xs font-mono text-foreground flex-1 break-all">
              {truncateHash(refund.transactionHash)}
            </code>
            <button
              onClick={handleCopyHash}
              className="shrink-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
              title="Copy transaction hash"
            >
              {copiedHash ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Cancellation reason */}
        {cancellation.reason && (
          <div className="p-5 border-b">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
              Cancellation Reason
            </p>
            <p className="text-sm text-foreground">{cancellation.reason}</p>
          </div>
        )}

        {/* Explorer link */}
        <div className="p-4 bg-muted/20 border-t flex justify-end">
          <a
            href={refund.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View on Stellar Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
