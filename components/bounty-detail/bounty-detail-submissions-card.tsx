"use client";

import { useState } from "react";
import { Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BountySubmissionType } from "@/lib/graphql/generated";
import {
  useSubmitToBounty,
  useReviewSubmission,
  useMarkSubmissionPaid,
} from "@/hooks/use-submission-mutations";
import { authClient } from "@/lib/auth-client";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  organizations?: string[];
}

interface BountyDetailSubmissionsCardProps {
  bounty: {
    id: string;
    status: string;
    organizationId: string;
    submissions?: Array<BountySubmissionType> | null;
  };
}

export function BountyDetailSubmissionsCard({
  bounty,
}: BountyDetailSubmissionsCardProps) {
  const { data: session } = authClient.useSession();
  const submissions = bounty.submissions || [];
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<BountySubmissionType | null>(null);
  const [prUrl, setPrUrl] = useState("");
  const [comments, setComments] = useState("");
  const [reviewStatus, setReviewStatus] = useState("APPROVED");
  const [transactionHash, setTransactionHash] = useState("");

  const submitToBounty = useSubmitToBounty();
  const reviewSubmission = useReviewSubmission();
  const markSubmissionPaid = useMarkSubmissionPaid();

  const isOrgMember =
    (session?.user as ExtendedUser)?.organizations?.includes(
      bounty.organizationId,
    ) ?? false;

  const handleSubmitPR = async () => {
    if (!prUrl.trim()) return;

    await submitToBounty.mutateAsync({
      bountyId: bounty.id,
      githubPullRequestUrl: prUrl,
      comments: comments.trim() || undefined,
    });

    setPrUrl("");
    setComments("");
    setSubmitDialogOpen(false);
  };

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return;

    await reviewSubmission.mutateAsync({
      submissionId: selectedSubmission.id,
      status: reviewStatus,
      reviewComments: comments.trim() || undefined,
    });

    setReviewDialogOpen(false);
    setSelectedSubmission(null);
    setComments("");
  };

  const handleMarkPaid = async (submission: BountySubmissionType) => {
    if (!transactionHash.trim()) return;

    await markSubmissionPaid.mutateAsync({
      submissionId: submission.id,
      transactionHash: transactionHash.trim(),
    });

    setTransactionHash("");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-900";
      case "REJECTED":
        return "bg-red-100 text-red-900";
      case "PENDING":
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const isSafeHttpUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {bounty.status === "OPEN" && (
        <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Submit Your PR
          </h3>
          <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Submit PR to Bounty</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Pull Request</DialogTitle>
                <DialogDescription>
                  Submit your GitHub pull request URL to claim this bounty.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pr-url">Pull Request URL</Label>
                  <Input
                    id="pr-url"
                    placeholder="https://github.com/owner/repo/pull/123"
                    value={prUrl}
                    onChange={(e) => setPrUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    placeholder="Add any additional context..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSubmitDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitPR}
                    disabled={!prUrl.trim() || submitToBounty.isPending}
                  >
                    {submitToBounty.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Submissions ({submissions.length})
          </h3>

          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="p-3 rounded-lg border border-gray-700 bg-gray-900/30 space-y-2"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-200">
                      {submission.submittedByUser?.name ||
                        submission.submittedBy}
                    </p>

                    {submission.githubPullRequestUrl &&
                      (isSafeHttpUrl(submission.githubPullRequestUrl) ? (
                        <a
                          href={submission.githubPullRequestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline break-all"
                        >
                          {submission.githubPullRequestUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 break-all">
                          {submission.githubPullRequestUrl}
                        </span>
                      ))}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                        submission.status,
                      )}`}
                    >
                      {submission.status}
                    </div>

                    {/* Org-only Actions */}
                    {isOrgMember && (
                      <div className="flex gap-2">
                        {!submission.reviewedAt && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setReviewDialogOpen(true);
                            }}
                          >
                            Review
                          </Button>
                        )}

                        {submission.status === "APPROVED" &&
                          !submission.paidAt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkPaid(submission)}
                              disabled={markSubmissionPaid.isPending}
                            >
                              {markSubmissionPaid.isPending && (
                                <Loader2 className="mr-2 size-3 animate-spin" />
                              )}
                              Mark Paid
                            </Button>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Info */}
                {submission.reviewedAt && (
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>
                      Reviewed by:{" "}
                      {submission.reviewedByUser?.name || submission.reviewedBy}
                    </p>
                    {submission.reviewComments && (
                      <p className="italic text-gray-500">
                        &quot;{submission.reviewComments}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Info */}
                {submission.paidAt && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <DollarSign className="size-3" />
                    <span>
                      Paid on {new Date(submission.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {submissions.length === 0 && bounty.status === "OPEN" && (
        <div className="p-8 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm text-center">
          <p className="text-sm text-gray-400">
            No submissions yet. Be the first to submit!
          </p>
        </div>
      )}
    </div>
  );
}
