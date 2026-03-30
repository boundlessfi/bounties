"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, GitBranch, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useMilestoneFlow } from "@/hooks/use-milestone-flow";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  organizations?: string[];
}

interface MilestoneFlowCardProps {
  bounty: {
    id: string;
    title: string;
    status: string;
    organizationId: string;
    rewardAmount?: number | null;
    rewardCurrency?: string | null;
  };
}

function isSafeHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function BountyDetailMilestoneFlowCard({
  bounty,
}: MilestoneFlowCardProps) {
  const { data: session } = authClient.useSession();
  const currentUser = (session?.user as ExtendedUser | undefined) ?? null;
  const currentUserId = currentUser?.id ?? "";
  const currentUserName =
    currentUser?.name?.trim() || currentUser?.email?.trim() || "Anonymous";

  const [prUrl, setPrUrl] = useState("");
  const [comments, setComments] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const {
    state,
    pendingSubmissions,
    stageOccupancy,
    getParticipant,
    joinFlow,
    submitMilestone,
    reviewSubmission,
  } = useMilestoneFlow(bounty.id);

  const canAct = bounty.status === "OPEN";
  const isOrgMember =
    (currentUser?.organizations ?? []).includes(bounty.organizationId) ?? false;
  const participant = currentUserId ? getParticipant(currentUserId) : undefined;

  const activeMilestone =
    participant && participant.currentMilestoneIndex < state.milestones.length
      ? state.milestones[participant.currentMilestoneIndex]
      : undefined;

  const approvedCount = useMemo(() => {
    return state.participants.filter((item) => item.status === "COMPLETED")
      .length;
  }, [state.participants]);

  const handleJoin = async () => {
    if (!currentUserId || !canAct) return;
    setActionError(null);
    setIsJoining(true);
    try {
      joinFlow(currentUserId, currentUserName);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to join flow.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmitMilestone = async () => {
    if (!currentUserId || !participant || !canAct) return;
    if (!isSafeHttpUrl(prUrl)) {
      setActionError("Enter a valid http(s) pull request URL.");
      return;
    }

    setActionError(null);
    setIsSubmitting(true);
    try {
      submitMilestone(
        currentUserId,
        prUrl.trim(),
        comments.trim() || undefined,
      );
      setPrUrl("");
      setComments("");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to submit milestone.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = (
    submissionId: string,
    decision: "APPROVED" | "REJECTED",
  ) => {
    if (!currentUserId) return;
    setActionError(null);
    try {
      reviewSubmission(submissionId, currentUserId, decision);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Review failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-200">
            Multi-Winner Milestone Flow
          </h3>
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Users className="size-3.5" />
            {state.participants.length} participants
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {state.milestones.map((milestone, index) => {
            const occupied = stageOccupancy[index] ?? 0;
            const percent = Math.min(
              100,
              Math.round((occupied / Math.max(milestone.maxWinners, 1)) * 100),
            );

            return (
              <div
                key={milestone.id}
                className="rounded-lg border border-gray-700 bg-gray-900/30 p-3 space-y-2"
              >
                <p className="text-xs font-semibold text-gray-200">
                  {milestone.title}
                </p>
                <p className="text-xs text-gray-400">{milestone.description}</p>
                <p className="text-[11px] text-gray-500">
                  Slots: {occupied}/{milestone.maxWinners} | Payout:{" "}
                  {milestone.rewardPercentage}%
                </p>
                <div className="h-1.5 w-full rounded bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            Final winners: {approvedCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5 text-yellow-400" />
            Pending reviews: {pendingSubmissions.length}
          </span>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-4">
        <h4 className="text-sm font-semibold text-gray-200">
          Contributor Actions
        </h4>

        {!currentUserId && (
          <p className="text-xs text-gray-400">
            Sign in to join this milestone flow and submit deliverables.
          </p>
        )}

        {currentUserId && !participant && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Join Milestone 1 to start. Progression to later milestones is
              based on approvals.
            </p>
            <Button disabled={!canAct || isJoining} onClick={handleJoin}>
              Join Milestone Flow
            </Button>
          </div>
        )}

        {participant && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3 space-y-1">
              <p className="text-xs text-gray-400">Your status</p>
              <p className="text-sm text-gray-200 font-medium">
                {participant.status}
              </p>
              {activeMilestone && (
                <p className="text-xs text-gray-400">
                  Current stage: {activeMilestone.title}
                </p>
              )}
            </div>

            {participant.status === "ACTIVE" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="milestone-pr-url">Pull Request URL</Label>
                  <Input
                    id="milestone-pr-url"
                    value={prUrl}
                    onChange={(event) => setPrUrl(event.target.value)}
                    placeholder="https://github.com/org/repo/pull/123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="milestone-comments">Notes</Label>
                  <Textarea
                    id="milestone-comments"
                    value={comments}
                    onChange={(event) => setComments(event.target.value)}
                    placeholder="Summarize what this milestone delivers..."
                  />
                </div>

                <Button
                  disabled={!canAct || !prUrl.trim() || isSubmitting}
                  onClick={handleSubmitMilestone}
                >
                  Submit Milestone
                </Button>
              </div>
            )}

            {participant.status === "SUBMITTED" && (
              <p className="text-xs text-yellow-300 inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                Your submission is pending sponsor review.
              </p>
            )}

            {participant.status === "COMPLETED" && (
              <p className="text-xs text-emerald-300 inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                You completed all milestones for this bounty.
              </p>
            )}

            {participant.status === "REJECTED" && (
              <p className="text-xs text-red-300 inline-flex items-center gap-1.5">
                <XCircle className="size-3.5" />
                Your milestone track ended on review.
              </p>
            )}
          </div>
        )}

        {actionError && (
          <p className="text-xs text-red-400 rounded border border-red-500/40 bg-red-500/10 p-2">
            {actionError}
          </p>
        )}
      </div>

      {isOrgMember && (
        <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-4">
          <h4 className="text-sm font-semibold text-gray-200">
            Sponsor Review Queue
          </h4>

          {pendingSubmissions.length === 0 && (
            <p className="text-xs text-gray-400">
              No pending milestone submissions.
            </p>
          )}

          {pendingSubmissions.length > 0 && (
            <div className="space-y-3">
              {pendingSubmissions.map((submission) => {
                const milestone = state.milestones[submission.milestoneIndex];
                return (
                  <div
                    key={submission.id}
                    className="p-3 rounded-lg border border-gray-700 bg-gray-900/30 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm text-gray-200 font-medium">
                          {submission.contributorName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {milestone?.title}
                        </p>
                        {isSafeHttpUrl(submission.githubPullRequestUrl) ? (
                          <a
                            className="text-xs text-primary hover:underline break-all inline-flex items-center gap-1"
                            href={submission.githubPullRequestUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <GitBranch className="size-3" />
                            {submission.githubPullRequestUrl}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500 break-all">
                            {submission.githubPullRequestUrl}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReview(submission.id, "REJECTED")
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleReview(submission.id, "APPROVED")
                          }
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
