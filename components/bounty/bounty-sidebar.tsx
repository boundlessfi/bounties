"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Bounty } from "@/types/bounty"
import { ExternalLink, Github, Link2, Clock, Calendar, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface BountySidebarProps {
  bounty: Bounty
}

export function BountySidebar({ bounty }: BountySidebarProps) {
  const [copied, setCopied] = useState(false)

  const isClaimable = bounty.status === "open"

  const createdTimeAgo = useMemo(
    () => formatDistanceToNow(new Date(bounty.createdAt), { addSuffix: true }),
    [bounty.createdAt]
  )

  const updatedTimeAgo = useMemo(
    () => formatDistanceToNow(new Date(bounty.updatedAt), { addSuffix: true }),
    [bounty.updatedAt]
  )

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Failed to copy link to clipboard:", error)
    }
  }

  const claimButtonText = bounty.status === "claimed"
    ? "Already Claimed"
    : bounty.status === "closed"
      ? "Bounty Closed"
      : "Claim Bounty"

  const claimButtonAriaLabel = !isClaimable
    ? `Cannot claim: ${claimButtonText}`
    : "Claim this bounty"

  return (
    <div className="sticky top-4 rounded-xl border border-gray-800 bg-background-card p-6 space-y-4">
      <Button asChild className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <a href={bounty.githubIssueUrl} target="_blank" rel="noopener noreferrer">
          <Github className="size-4" />
          View on GitHub
        </a>
      </Button>

      <Button
        className={cn(
          "w-full gap-2",
          isClaimable
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-gray-800 text-gray-400 cursor-not-allowed"
        )}
        disabled={!isClaimable}
        aria-label={claimButtonAriaLabel}
        title={!isClaimable ? claimButtonText : undefined}
      >
        {claimButtonText}
      </Button>

      <Separator className="bg-gray-800" />



      <a
        href={`https://github.com/${bounty.githubRepo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <Github className="size-4" />
        View Repository
      </a>

      <Separator className="bg-gray-800" />

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="size-4" />
          <span>Created {createdTimeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          <span>Updated {updatedTimeAgo}</span>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      <Button
        className="w-full gap-2 bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-gray-100"
        onClick={handleCopyLink}
      >
        {copied ? <Check className="size-4 text-success-400" /> : <Link2 className="size-4" />}
        {copied ? "Copied!" : "Share"}
      </Button>
    </div>
  )
}
