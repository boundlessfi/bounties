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

  const isOrgMember = session?.user?.id && bounty.organizationId; // Simplified check

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

  return (
    <div className="space-y-6">
      {/* Submit PR Section */}
      {bounty.status === "OPEN" && (
        <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Submit Your PR
          </h3>
          <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="default">
                Submit PR to Bounty
              </Button>
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

      {/* Submissions List */}
      {submissions.length > 0 && (
        <div className="p-5 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-200">
            Submissions ({submissions.length})
          </h3>
          <div className="space-y-3">
            {submissions.map((submission: BountySubmissionType) => (
              <div
                key={submission.id}
                className="p-3 rounded-lg border border-gray-700 bg-gray-900/30 space-y-2"
              >
                {/* Submitter Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-200">
                      {submission.submittedByUser?.name ||
                        submission.submittedBy}
                    </p>
                    {submission.githubPullRequestUrl && (
                      <a
                        href={submission.githubPullRequestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {submission.githubPullRequestUrl}
                      </a>
                    )}
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                      submission.status,
                    )}`}
                  >
                    {submission.status}
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

                {/* Payment Status */}
                {submission.paidAt ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <DollarSign className="size-3" />
                    <span>
                      Paid on {new Date(submission.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : submission.status === "APPROVED" && isOrgMember ? (
                  <div className="pt-2 border-t border-gray-700">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full">
                          Mark as Paid
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Mark Submission as Paid</DialogTitle>
                          <DialogDescription>
                            Enter the transaction hash for the payment.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="tx-hash">Transaction Hash</Label>
                            <Input
                              id="tx-hash"
                              placeholder="0x..."
                              value={transactionHash}
                              onChange={(e) =>
                                setTransactionHash(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              onClick={() => handleMarkPaid(submission)}
                              disabled={
                                !transactionHash.trim() ||
                                markSubmissionPaid.isPending
                              }
                            >
                              {markSubmissionPaid.isPending && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                              )}
                              Mark as Paid
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : null}

                {/* Review Actions */}
                {!submission.reviewedAt && isOrgMember && (
                  <div className="pt-2 border-t border-gray-700">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setReviewDialogOpen(true);
                      }}
                    >
                      Review Submission
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Review the pull request and provide feedback.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-900 text-gray-200"
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-comments">Comments</Label>
                <Textarea
                  id="review-comments"
                  placeholder="Add review feedback..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReviewDialogOpen(false);
                    setSelectedSubmission(null);
                    setComments("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewSubmission}
                  disabled={reviewSubmission.isPending}
                >
                  {reviewSubmission.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {submissions.length === 0 && bounty.status === "OPEN" && (
        <div className="p-8 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm text-center space-y-2">
          <p className="text-sm text-gray-400">
            No submissions yet. Be the first to submit!
          </p>
        </div>
      )}
    </div>
  );
}
