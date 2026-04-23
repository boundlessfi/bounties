"use client";

import { cn } from "@/lib/utils";
import {
  useOnChainBounty,
  type ConsistencyState,
  type OnChainStatus,
} from "@/hooks/use-onchain-bounty";
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnChainStatusBadgeProps {
  bountyId: string;
  className?: string;
  showConflictDetails?: boolean;
}

const statusLabels: Record<OnChainStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  submitted: "Submitted",
  approved: "Approved",
  claimed: "Claimed",
  cancelled: "Cancelled",
  unknown: "Unknown",
};

const consistencyConfig: Record<
  ConsistencyState,
  {
    icon: React.ReactNode;
    label: string;
    badgeClass: string;
    tooltipText: string;
  }
> = {
  loading: {
    icon: <Loader2 className="size-3 animate-spin" />,
    label: "Verifying",
    badgeClass: "border-muted-foreground/30 text-muted-foreground",
    tooltipText: "Checking on-chain state…",
  },
  consistent: {
    icon: <ShieldCheck className="size-3" />,
    label: "Verified on-chain",
    badgeClass: "border-emerald-500/60 text-emerald-500 bg-emerald-500/10",
    tooltipText: "On-chain status matches off-chain data.",
  },
  conflict: {
    icon: <ShieldAlert className="size-3" />,
    label: "Status conflict",
    badgeClass: "border-amber-500/60 text-amber-500 bg-amber-500/10",
    tooltipText:
      "On-chain status differs from the database. On-chain is the source of truth.",
  },
  unverified: {
    icon: <ShieldOff className="size-3" />,
    label: "Not verified",
    badgeClass: "border-muted-foreground/30 text-muted-foreground",
    tooltipText: "On-chain status could not be verified.",
  },
};

export function OnChainStatusBadge({
  bountyId,
  className,
  showConflictDetails = false,
}: OnChainStatusBadgeProps) {
  const { consistencyState, onChainData, graphqlBounty, explorerUrl } =
    useOnChainBounty(bountyId);

  const config = consistencyConfig[consistencyState];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="cursor-default rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-0.5 select-none pointer-events-none",
                  config.badgeClass,
                )}
              >
                {config.icon}
                <span>{config.label}</span>
              </Badge>
            </button>
          </TooltipTrigger>

          <TooltipContent className="max-w-xs text-xs" side="bottom">
            <p>{config.tooltipText}</p>

            {consistencyState === "conflict" && showConflictDetails && (
              <div className="mt-1.5 space-y-0.5 border-t border-border/50 pt-1.5">
                {onChainData?.status && onChainData.status !== "unknown" && (
                  <p>
                    <span className="text-muted-foreground">On-chain: </span>
                    <span className="font-medium text-foreground">
                      {statusLabels[onChainData.status]}
                    </span>
                  </p>
                )}
                {graphqlBounty && (
                  <p>
                    <span className="text-muted-foreground">Database: </span>
                    <span className="font-medium text-foreground">
                      {graphqlBounty.status}
                    </span>
                  </p>
                )}
              </div>
            )}

            {onChainData?.ledger && (
              <p className="mt-1 text-muted-foreground">
                Ledger #{onChainData.ledger}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="View on Stellar Explorer"
        >
          <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}
