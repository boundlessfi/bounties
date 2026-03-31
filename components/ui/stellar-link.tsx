"use client";

import React, { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getTransactionUrl,
  getAccountUrl,
  getContractUrl,
  getStellarNetwork,
  StellarNetwork,
  isValidStellarAddress,
  isValidStellarTxHash,
  isValidStellarContractId,
} from "@/lib/utils/stellar-explorer";

export type StellarLinkType = "transaction" | "account" | "contract";

interface StellarLinkProps {
  /** The value to link to (transaction hash, address, or contract ID) */
  value: string;
  /** The type of link */
  type: StellarLinkType;
  /** Optional network override */
  network?: StellarNetwork;
  /** Optional explorer override */
  explorer?: string;
  /** Maximum characters to display before truncating */
  maxLength?: number;
  /** Whether to show the copy button */
  showCopy?: boolean;
  /** Whether to show the external link icon */
  showExternalIcon?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Custom link text (overrides truncation) */
  linkText?: string;
  /** Tooltip text prefix */
  tooltipPrefix?: string;
}

export function StellarLink({
  value,
  type,
  network,
  explorer = "stellar.expert",
  maxLength = 12,
  showCopy = true,
  showExternalIcon = true,
  className,
  linkText,
  tooltipPrefix,
}: StellarLinkProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Validate the input
  const isValid = React.useMemo(() => {
    switch (type) {
      case "transaction":
        return isValidStellarTxHash(value);
      case "account":
        return isValidStellarAddress(value);
      case "contract":
        return isValidStellarContractId(value);
      default:
        return false;
    }
  }, [value, type]);

  // Generate the appropriate URL
  const url = React.useMemo(() => {
    if (!isValid) return "";

    try {
      const detectedNetwork = network || getStellarNetwork();

      switch (type) {
        case "transaction":
          return getTransactionUrl(value, detectedNetwork, explorer);
        case "account":
          return getAccountUrl(value, detectedNetwork, explorer);
        case "contract":
          return getContractUrl(value, detectedNetwork, explorer);
        default:
          return "";
      }
    } catch (error) {
      console.error("Error generating Stellar URL:", error);
      return "";
    }
  }, [value, type, network, explorer, isValid]);

  // Truncate the display value
  const displayValue = React.useMemo(() => {
    if (linkText) return linkText;
    if (!value) return "";
    if (value.length <= maxLength) return value;

    const start = value.slice(0, Math.ceil(maxLength / 2));
    const end = value.slice(-Math.floor(maxLength / 2));
    return `${start}...${end}`;
  }, [value, maxLength, linkText]);

  // Copy to clipboard handler
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  // Generate tooltip text
  const tooltipText = React.useMemo(() => {
    if (!isValid) return `Invalid ${type}`;
    const prefix = tooltipPrefix || `View ${type}`;
    const networkText = network || getStellarNetwork();
    return `${prefix} on ${networkText} • ${explorer}`;
  }, [type, network, explorer, isValid, tooltipPrefix, value]);

  if (!value || !isValid) {
    return (
      <span
        className={cn("text-muted-foreground font-mono text-sm", className)}
      >
        {displayValue || "Invalid"}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("inline-flex items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1 text-primary hover:text-primary/80",
                "transition-colors duration-200",
                "font-mono text-sm",
                "hover:underline",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1",
              )}
            >
              <span>{displayValue}</span>
              {showExternalIcon && (
                <ExternalLink className="h-3 w-3 shrink-0" />
              )}
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>

        {showCopy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopy}
                className={cn(
                  "h-6 w-6 shrink-0",
                  copied && "text-green-600",
                  copyError && "text-red-600",
                )}
                aria-label={`Copy ${type} value`}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : copyError ? (
                  <span className="text-xs">!</span>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {copied ? "Copied!" : copyError ? "Failed" : `Copy ${type}`}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Convenience components for specific types
export function TransactionLink(props: Omit<StellarLinkProps, "type">) {
  return <StellarLink {...props} type="transaction" />;
}

export function AccountLink(props: Omit<StellarLinkProps, "type">) {
  return <StellarLink {...props} type="account" />;
}

export function ContractLink(props: Omit<StellarLinkProps, "type">) {
  return <StellarLink {...props} type="contract" />;
}
