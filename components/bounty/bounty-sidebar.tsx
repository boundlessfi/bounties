"use client"

import { useMemo, useState } from "react"
import { RatingModal } from "../rating/rating-modal"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Bounty } from "@/types/bounty"
import { Github, Link2, Clock, Calendar, Check, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
// import { cn } from "@/lib/utils"
// import { useRouter } from "next/navigation" // If we need refresh
import { ApplicationDialog } from "./application-dialog"
import { toast } from "sonner"
import { ParticipantCard } from "./participant-card"

interface BountySidebarProps {
  bounty: Bounty
}

export function BountySidebar({ bounty }: BountySidebarProps) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  // const router = useRouter()

  // Mock user ID and maintainer check for now - in real app this comes from auth context
  // DEV-MOCK: Allow maintainer to test rating flow locally.
  // WARNING: This is a client-side dev-only bypass and MUST NOT be enabled in production.
  // TODO: Replace with real auth context and enforce authorization server-side.

  // Opt-in via environment (local/.env.local):
  // NEXT_PUBLIC_MOCK_MAINTAINER=true
  // NEXT_PUBLIC_MOCK_USER_ID=mock-user-123
  const CURRENT_USER_ID = process.env.NEXT_PUBLIC_MOCK_USER_ID ?? "mock-user-123"
  const IS_MAINTAINER = process.env.NEXT_PUBLIC_MOCK_MAINTAINER === "true"

  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_MOCK_MAINTAINER === "true") {
    console.warn(
      "DEV: Mock maintainer enabled in components/bounty/bounty-sidebar.tsx — do NOT enable in production"
    )
  }

  // const isClaimable = bounty.status === "open"

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

  const handleAction = async (endpoint: string, body: object = {}): Promise<boolean> => {
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributorId: CURRENT_USER_ID, ...body })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Action failed')
        return false
      }

      toast('Action completed successfully')
      window.location.reload()
      return true

    } catch (error) {
      console.error('Action error:', error)
      alert('Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Rating modal state
  const [showRating, setShowRating] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [lastRating, setLastRating] = useState<number | null>(null)
  const [reputationGain, setReputationGain] = useState<number | null>(null)
  const [hasRated, setHasRated] = useState(false)

  const handleMarkCompleted = async () => {
    if (!IS_MAINTAINER) {
      alert('Only maintainers can mark as completed.');
      return;
    }
    setLoading(true)
    // Simulate completion API call
    setTimeout(() => {
      setLoading(false)
      setCompleted(true)
      setShowRating(true)
    }, 1000)
  }

  const handleSubmitRating = async (rating: number, feedback: string) => {
    if (hasRated) {
      alert('You have already rated this contributor.');
      return;
    }
    if (!IS_MAINTAINER) {
      alert('Only maintainers can rate contributors.');
      return;
    }
    if (!completed) {
      alert('Bounty must be marked as completed before rating.');
      return;
    }
    // Simulate API call to reputation endpoint and calculate points
    await new Promise((res) => setTimeout(res, 1000))
    // Use feedback variable to avoid unused variable lint warnings
    void feedback
    setLastRating(rating)
    setReputationGain(rating * 10)
    setHasRated(true)
    setShowRating(false)
    // Notify contributor (mock)
    toast.success(`You have been rated ${rating} star${rating > 1 ? 's' : ''} and gained +${rating * 10} reputation!`, {
      description: 'Congratulations on your contribution!'
    })
  }

  const renderActionButton = () => {
    if (bounty.status === 'claimed' && IS_MAINTAINER && !completed) {
      return (
        <Button onClick={handleMarkCompleted} disabled={loading} className="w-full gap-2 bg-green-600 text-white hover:bg-green-700">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Mark as Completed
        </Button>
      )
    }
    if (bounty.status !== 'open') {
      const labels: Record<string, string> = {
        claimed: 'Already Claimed',
        closed: 'Bounty Closed'
      }
      return (
        <Button disabled className="w-full gap-2  cursor-not-allowed">
          {labels[bounty.status] || 'Not Available'}
        </Button>
      )
    }

    // Check participation
    if (bounty.claimingModel === 'application' && bounty.applicants?.includes(CURRENT_USER_ID)) {
      return (
        <Button disabled className="w-full gap-2 cursor-not-allowed">
          Application Submitted
        </Button>
      )
    }

    if (bounty.claimingModel === 'competition' && bounty.competitors?.includes(CURRENT_USER_ID)) {
      return (
        <Button disabled className="w-full gap-2  cursor-not-allowed">
          Already Joined
        </Button>
      )
    }

    if (bounty.claimingModel === 'milestone' && bounty.members?.includes(CURRENT_USER_ID)) {
      return (
        <Button disabled className="w-full gap-2 cursor-not-allowed">
          Already Joined
        </Button>
      )
    }

    if (bounty.claimingModel === 'application') {
      return (
        <ApplicationDialog
          bountyTitle={bounty.issueTitle}
          trigger={
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Apply Now
            </Button>
          }
          onApply={async (data) => {
            return await handleAction(`/api/bounties/${bounty.id}/apply`, { ...data, applicantId: CURRENT_USER_ID })
          }}
        />
      )
    }

    let label = 'Claim Bounty'
    let endpoint = `/api/bounties/${bounty.id}/claim`
    const body = {}

    if (bounty.claimingModel === 'competition') {
      label = 'Join Competition'
      endpoint = `/api/bounties/${bounty.id}/competition/join`
    } else if (bounty.claimingModel === 'milestone') {
      label = 'Join Milestone'
      endpoint = `/api/bounties/${bounty.id}/join`
    }

    return (
      <Button
        onClick={() => handleAction(endpoint, body)}
        disabled={loading}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </Button>
    )
  }

  return (
    <div className="sticky top-4 rounded-xl border border-gray-800 bg-background-card p-6 space-y-4">
      {/* Sidebar UI */}
      {showRating && !hasRated && (
        <RatingModal
          contributor={{ id: bounty.claimedBy || '', name: 'Contributor', reputation: 100 + (reputationGain || 0) }}
          bounty={{ id: bounty.id, title: bounty.issueTitle }}
          onSubmit={handleSubmitRating}
          onClose={() => setShowRating(false)}
        />
      )}

      {/* Show rating and reputation gain after rating, visible to all users if available */}
      {lastRating && reputationGain && (
        <div className="p-4 mb-4 rounded bg-green-900/60 text-green-200 border border-green-700">
          <div className="mb-1">{IS_MAINTAINER ? 'You rated the contributor:' : 'Contributor was rated:'} <b>{lastRating} / 5</b> stars</div>
          <div>Reputation gained: <b>+{reputationGain}</b></div>
        </div>
      )}
      <Button asChild className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <a href={bounty.githubIssueUrl} target="_blank" rel="noopener noreferrer">
          <Github className="size-4" />
          View on GitHub
        </a>
      </Button>

      {renderActionButton()}

      <Separator className="bg-gray-800" />

      {bounty.claimedBy && (
        <>
          <div className="space-y-3">
            <ParticipantCard userId={bounty.claimedBy} label="Claimed by" />
          </div>
          <Separator className="bg-gray-800" />
        </>
      )}

      <a
        href={`https://github.com/${bounty.githubRepo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm transition-colors"
      >
        <Github className="size-4" />
        View Repository
      </a>

      <Separator className="" />

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="size-4" />
          <span>Created {createdTimeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          <span>Updated {updatedTimeAgo}</span>
        </div>
      </div>

      <Separator className="" />

      <Button
        className="w-full gap-2 border border-gray-700"
        onClick={handleCopyLink}
      >
        {copied ? <Check className="size-4 text-success-400" /> : <Link2 className="size-4" />}
        {copied ? "Copied!" : "Share"}
      </Button>
    </div>
  )
}
