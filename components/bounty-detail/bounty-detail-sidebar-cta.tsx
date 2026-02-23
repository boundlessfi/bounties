"use client";

import { useState } from "react";
import { Github, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { Bounty } from "@/types/bounty";
import { StatusBadge, TypeBadge } from "./bounty-badges";

export function SidebarCTA({ bounty }: { bounty: Bounty }) {
  const [copied, setCopied] = useState(false);
  const canAct = bounty.status === "OPEN";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed
    }
  };

  const ctaLabel = () => {
    if (!canAct) {
      switch (bounty.status) {
        case "IN_PROGRESS":
          return "In Progress";
        case "COMPLETED":
          return "Completed";
        case "CANCELLED":
          return "Cancelled";
        default:
          return "Not Available";
      }
    }
    return "Submit to Bounty";
  };

  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm space-y-5">
      {/* Reward */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">
          Reward
        </span>
        <div className="text-right">
          <p className="text-2xl font-black text-primary tabular-nums leading-tight">
            {bounty.rewardAmount != null
              ? `$${bounty.rewardAmount.toLocaleString()}`
              : "TBD"}
          </p>
          <p className="text-[10px] text-gray-500 font-medium">
            {bounty.rewardCurrency}
          </p>
        </div>
      </div>

      <Separator className="bg-gray-800/60" />

      {/* Meta */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-gray-400">
          <span>Status</span>
          <StatusBadge status={bounty.status} />
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span>Type</span>
          <TypeBadge type={bounty.type} />
        </div>
      </div>

      <Separator className="bg-gray-800/60" />

      {/* CTA */}
      <Button
        className="w-full h-11 font-bold tracking-wide"
        disabled={!canAct}
        size="lg"
        onClick={() =>
          canAct &&
          window.open(bounty.githubIssueUrl, "_blank", "noopener,noreferrer")
        }
      >
        {ctaLabel()}
      </Button>

      {!canAct && (
        <p className="flex items-center gap-1.5 text-xs text-gray-500 justify-center text-center">
          <AlertCircle className="size-3 shrink-0" />
          This bounty is no longer accepting new submissions.
        </p>
      )}

      {/* GitHub */}
      <a
        href={bounty.githubIssueUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
      >
        <Github className="size-3" />
        View on GitHub
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="size-3" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}

export function MobileCTA({ bounty }: { bounty: Bounty }) {
  const canAct = bounty.status === "OPEN";

  const label = () => {
    if (!canAct) {
      switch (bounty.status) {
        case "IN_PROGRESS":
          return "In Progress";
        case "COMPLETED":
          return "Completed";
        default:
          return "Not Available";
      }
    }
    return "Submit to Bounty";
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-gray-800/60 z-20">
      <Button
        className="w-full h-11 font-bold tracking-wide"
        disabled={!canAct}
        size="lg"
        onClick={() =>
          canAct &&
          window.open(bounty.githubIssueUrl, "_blank", "noopener,noreferrer")
        }
      >
        {label()}
      </Button>
    </div>
  );
}
