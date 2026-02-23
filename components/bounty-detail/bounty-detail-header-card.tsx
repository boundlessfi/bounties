import { ExternalLink, GitBranch } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Bounty } from "@/types/bounty";
import { StatusBadge, TypeBadge } from "./bounty-badges";

export function HeaderCard({ bounty }: { bounty: Bounty }) {
  const orgName = bounty.organization?.name ?? "Unknown";
  const orgLogo = bounty.organization?.logo;

  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <StatusBadge status={bounty.status} />
        <TypeBadge type={bounty.type} />
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-50 leading-snug mb-2">
        {bounty.title}
      </h1>

      {/* Repo + issue number */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <GitBranch className="size-3.5" />
        <a
          href={bounty.githubIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          {bounty.githubIssueNumber && `#${bounty.githubIssueNumber}`}
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* Reward – mobile only */}
      <div className="flex items-center justify-between mb-5 lg:hidden p-3 rounded-lg bg-gray-900/50 border border-gray-800/60">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Reward
        </span>
        <span className="text-xl font-black text-primary tabular-nums">
          {bounty.rewardAmount != null
            ? `$${bounty.rewardAmount.toLocaleString()}`
            : "TBD"}
          <span className="text-xs font-normal text-gray-500 ml-1">
            {bounty.rewardCurrency}
          </span>
        </span>
      </div>

      {/* Organization */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800/60 w-fit">
        <Avatar className="size-8 rounded-md border border-gray-700 shrink-0">
          <AvatarImage src={orgLogo ?? undefined} alt={orgName} />
          <AvatarFallback className="rounded-md text-xs font-bold bg-gray-800 text-gray-300">
            {orgName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-none mb-0.5">
            Organization
          </p>
          <p className="text-sm font-semibold text-gray-200">{orgName}</p>
        </div>
      </div>
    </div>
  );
}
