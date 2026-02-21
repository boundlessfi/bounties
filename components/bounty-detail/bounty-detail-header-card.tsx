import Link from "next/link";
import { ExternalLink, Tag, GitBranch } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Bounty } from "@/lib/api";
import { DifficultyBadge, StatusBadge } from "./bounty-badges";

export function HeaderCard({ bounty }: { bounty: Bounty }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <StatusBadge status={bounty.status} />
        {bounty.difficulty && (
          <DifficultyBadge difficulty={bounty.difficulty} />
        )}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-gray-800 text-gray-300 border border-gray-700">
          {bounty.type}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-50 leading-snug mb-2">
        {bounty.issueTitle}
      </h1>

      {/* Repo + issue number */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
        <GitBranch className="size-3.5" />
        <span>{bounty.githubRepo}</span>
        <span>·</span>
        <a
          href={bounty.githubIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          #{bounty.issueNumber}
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

      {/* Project */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800/60 w-fit mb-5">
        <Avatar className="size-8 rounded-md border border-gray-700 shrink-0">
          <AvatarImage
            src={bounty.projectLogoUrl ?? undefined}
            alt={bounty.projectName}
          />
          <AvatarFallback className="rounded-md text-xs font-bold bg-gray-800 text-gray-300">
            {bounty.projectName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-none mb-0.5">
            Project
          </p>
          <Link
            href={`/projects/${bounty.projectId}`}
            className="text-sm font-semibold text-gray-200 hover:text-primary transition-colors flex items-center gap-1"
          >
            {bounty.projectName}
            <ExternalLink className="size-3 text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Tags */}
      {bounty.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="size-3.5 text-gray-600 shrink-0" />
          {bounty.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700/60 lowercase"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
