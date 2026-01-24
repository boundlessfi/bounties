import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { Bounty, BountyType, BountyStatus, DifficultyLevel } from "@/types/bounty"
import { Bug, Sparkles, FileText, RefreshCw, Circle } from "lucide-react"

const typeConfig: Record<BountyType, { label: string; icon: React.ReactNode; className: string }> = {
  bug: { label: "Bug", icon: <Bug className="size-3" />, className: "bg-error-500 text-white border-transparent" },
  feature: { label: "Feature", icon: <Sparkles className="size-3" />, className: "bg-primary text-primary-foreground border-transparent" },
  documentation: { label: "Docs", icon: <FileText className="size-3" />, className: "bg-secondary-500 text-white border-transparent" },
  refactor: { label: "Refactor", icon: <RefreshCw className="size-3" />, className: "bg-gray-700 text-gray-100 border-transparent" },
  other: { label: "Other", icon: <Circle className="size-3" />, className: "bg-gray-800 text-gray-300 border-gray-600" },
}

const statusConfig: Record<BountyStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-success-500 text-white border-transparent" },
  claimed: { label: "Claimed", className: "bg-warning-500 text-white border-transparent" },
  closed: { label: "Closed", className: "bg-gray-700 text-gray-300 border-transparent" },
}

const difficultyConfig: Record<DifficultyLevel, { label: string; className: string }> = {
  beginner: { label: "Beginner", className: "text-success-300" },
  intermediate: { label: "Intermediate", className: "text-warning-300" },
  advanced: { label: "Advanced", className: "text-error-300" },
}

import { cn } from "@/lib/utils"

interface BountyHeaderProps {
  bounty: Bounty
}

export function BountyHeader({ bounty }: BountyHeaderProps) {
  const typeInfo = typeConfig[bounty.type]
  const statusInfo = statusConfig[bounty.status]

  // Handle potentially missing difficulty or map old values if needed, 
  // but strictly we expect beginner/intermediate/advanced now.
  const difficultyInfo = bounty.difficulty ? difficultyConfig[bounty.difficulty] : { label: "Unknown", className: "text-gray-500" }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge className={typeInfo.className}>
          {typeInfo.icon}
          {typeInfo.label}
        </Badge>
        <Badge className={statusInfo.className}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl md:text-5xl leading-tight">
          {bounty.issueTitle}
        </h1>

        <div className="flex items-center gap-3">
          {bounty.projectLogoUrl ? (
            <div className="relative size-6 shrink-0 overflow-hidden rounded bg-gray-800">
              <Image
                src={bounty.projectLogoUrl}
                alt={bounty.projectName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="size-6 shrink-0 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
              {bounty.projectName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-muted-foreground">{bounty.projectName}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-2">
        {(bounty.rewardAmount !== null && bounty.rewardAmount !== undefined) ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Reward</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-primary tabular-nums tracking-tight">
                {bounty.rewardAmount.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-gray-400">{bounty.rewardCurrency}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Reward</span>
            <span className="text-lg font-medium text-gray-400">-</span>
          </div>
        )}

        {bounty.difficulty && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Difficulty</span>
            <Badge variant="outline" className={cn("w-fit capitalize border-opacity-30", difficultyInfo.className)}>
              {difficultyInfo.label}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
