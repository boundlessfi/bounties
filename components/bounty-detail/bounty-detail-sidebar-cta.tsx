"use client";

import { useState } from "react";
import { Github, Copy, Check, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { Bounty } from "@/lib/api";
import { DifficultyBadge, StatusBadge } from "./bounty-badges";
import { CLAIMING_MODEL_CONFIG } from "@/lib/bounty-config";
import { SubmissionDialog } from "./submission-dialog";

export function SidebarCTA({ bounty }: { bounty: Bounty }) {
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const canAct = bounty.status === "open";
  const claimCfg = CLAIMING_MODEL_CONFIG[bounty.claimingModel];
  const ClaimIcon = claimCfg.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed (e.g. non-HTTPS, permission denied)
    }
  };

  const ctaLabel = () => {
    if (!canAct)
      return bounty.status === "claimed" ? "Already Claimed" : "Bounty Closed";
    switch (bounty.claimingModel) {
      case "single-claim":
        return "Claim Bounty";
      case "application":
        return "Apply Now";
      case "competition":
        return "Submit Entry";
      case "multi-winner":
        return "Submit Work";
    }
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
          <span>Model</span>
          <span className="flex items-center gap-1.5 text-gray-200 font-medium">
            <ClaimIcon className="size-3.5 text-gray-500" />
            {claimCfg.label}
          </span>
        </div>
        {bounty.difficulty && (
          <div className="flex items-center justify-between text-gray-400">
            <span>Difficulty</span>
            <DifficultyBadge difficulty={bounty.difficulty} />
          </div>
        )}
        {bounty.submissionsEndDate && (
          <div className="flex items-center justify-between text-gray-400">
            <span>Deadline</span>
            <span className="flex items-center gap-1.5 text-gray-200 text-xs font-medium">
              <Clock className="size-3.5 text-gray-500" />
              {new Date(bounty.submissionsEndDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      <Separator className="bg-gray-800/60" />

      {/* CTA */}
      <Button
        className="w-full h-11 font-bold tracking-wide"
        disabled={!canAct}
        size="lg"
        onClick={() => canAct && setDialogOpen(true)}
      >
        {ctaLabel()}
      </Button>

      <SubmissionDialog
        bountyId={bounty.id}
        bountyTitle={bounty.issueTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {!canAct && (
        <p className="flex items-center gap-1.5 text-xs text-gray-500 justify-center text-center">
          <AlertCircle className="size-3 shrink-0" />
          {bounty.status === "claimed"
            ? "A contributor has already claimed this bounty."
            : "This bounty is no longer accepting submissions."}
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

export function ClaimModelInfo({
  claimingModel,
}: {
  claimingModel: Bounty["claimingModel"];
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-800 bg-background-card/60 space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Claim Model
      </h3>
      <p className="text-xs text-gray-400 leading-relaxed">
        {CLAIMING_MODEL_CONFIG[claimingModel].description}
      </p>
    </div>
  );
}

export function MobileCTA({ bounty }: { bounty: Bounty }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const canAct = bounty.status === "open";

  const label = () => {
    if (!canAct)
      return bounty.status === "claimed" ? "Already Claimed" : "Bounty Closed";
    switch (bounty.claimingModel) {
      case "single-claim":
        return "Claim Bounty";
      case "application":
        return "Apply Now";
      case "competition":
        return "Submit Entry";
      case "multi-winner":
        return "Submit Work";
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-gray-800/60 z-20">
      <Button
        className="w-full h-11 font-bold tracking-wide"
        disabled={!canAct}
        size="lg"
        onClick={() => canAct && setDialogOpen(true)}
      >
        {label()}
      </Button>

      <SubmissionDialog
        bountyId={bounty.id}
        bountyTitle={bounty.issueTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
