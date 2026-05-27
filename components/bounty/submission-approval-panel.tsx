"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveApplicationSubmission,
  useRequestRevisions,
} from "@/hooks/use-bounty-application";
import { toast } from "sonner";
import type { BountyFieldsFragment } from "@/lib/graphql/generated";
import type { Bounty } from "@/types/bounty";

type ApprovalPanelBounty = BountyFieldsFragment & Partial<Bounty>;

interface SubmissionApprovalPanelProps {
  bounty: ApprovalPanelBounty;
  creatorAddress: string;
  submittedWorkCid?: string;
  submissionDescription?: string;
}

export function SubmissionApprovalPanel({
  bounty,
  creatorAddress,
  submittedWorkCid,
  submissionDescription,
}: SubmissionApprovalPanelProps) {
  const [points, setPoints] = useState<number>(5);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  const { mutate: approveSubmission, isPending: isApproving } =
    useApproveApplicationSubmission();
  const { mutate: requestRevisions, isPending: isRequestingRevisions } =
    useRequestRevisions();

  const handleApprove = () => {
    const clampedPoints = Math.max(1, Math.min(100, points || 0));
    approveSubmission(
      {
        bountyId: bounty.id,
        creatorAddress,
        points: clampedPoints,
      },
      {
        onSuccess: () =>
          toast.success("Submission approved and payment released."),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Approval failed."),
      },
    );
  };

  const handleRequestRevisions = () => {
    if (!revisionFeedback.trim()) {
      toast.error("Please provide feedback describing the changes needed.");
      return;
    }
    requestRevisions(
      {
        bountyId: bounty.id,
        submissionId: bounty.id, // submission ID maps to bounty for now
        feedback: revisionFeedback.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Revision request sent to contributor.");
          setRevisionFeedback("");
          setShowRevisionForm(false);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to request revisions.",
          ),
      },
    );
  };

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-emerald-500/10 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="size-5" />
          Review Submission
        </CardTitle>
        <CardDescription className="text-emerald-500/70">
          The selected applicant has submitted their work for your approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="bg-background-card/50 rounded-lg p-4 border border-gray-800">
          <h3 className="font-semibold text-gray-200 mb-2">Submitted Work</h3>
          {submissionDescription && (
            <p className="text-gray-400 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
              {submissionDescription}
            </p>
          )}
          {submittedWorkCid ? (
            <a
              href={`https://ipfs.io/ipfs/${submittedWorkCid}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              <ExternalLink className="size-4" />
              View Deliverable (IPFS)
            </a>
          ) : (
            <span className="text-sm text-gray-500 italic">
              No deliverable link provided.
            </span>
          )}
        </div>

        <Separator className="bg-emerald-500/10" />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Approve Section */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="reputation-points"
                className="text-sm font-medium text-gray-300"
              >
                Award Reputation Points
              </Label>
              <p className="text-xs text-gray-500 mt-1 mb-2">
                Reward the contributor with points that boost their tier.
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Input
                    id="reputation-points"
                    type="number"
                    min="1"
                    max="100"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    className="w-24 border-gray-700 bg-gray-900/50"
                  />
                  <span className="text-sm text-gray-400">Points</span>
                </div>
                <span className="text-[10px] text-gray-500 italic">
                  Tip: 5 = Average, 20+ = Exceptional
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              onClick={handleApprove}
              disabled={isApproving || isRequestingRevisions}
            >
              <CheckCircle className="size-4 mr-2" />
              {isApproving ? "Approving..." : "Approve & Release Payment"}
            </Button>
          </div>

          {/* Revision Section */}
          <div className="space-y-4 border-l border-gray-800/50 pl-6">
            {!showRevisionForm ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 border border-dashed border-amber-500/30 rounded-lg bg-amber-500/5">
                <AlertTriangle className="size-6 text-amber-500 mb-2" />
                <h4 className="text-sm font-medium text-gray-300 mb-1">
                  Needs Changes?
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Request revisions before releasing the escrow.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => setShowRevisionForm(true)}
                  disabled={isApproving}
                >
                  <RotateCcw className="size-3 mr-1.5" />
                  Request Revisions
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="revision-feedback"
                    className="text-sm font-medium text-gray-300"
                  >
                    Revision Feedback <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Describe what needs to change. The contributor will see this
                    before resubmitting.
                  </p>
                  <Textarea
                    id="revision-feedback"
                    placeholder="e.g. The deployment docs are missing the environment setup steps..."
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    className="min-h-[100px] bg-gray-900/50 border-gray-700 resize-none"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-400"
                    onClick={() => {
                      setShowRevisionForm(false);
                      setRevisionFeedback("");
                    }}
                    disabled={isRequestingRevisions}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleRequestRevisions}
                    disabled={!revisionFeedback.trim() || isRequestingRevisions}
                  >
                    {isRequestingRevisions ? (
                      <>
                        <Loader2 className="size-3 mr-1.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="size-3 mr-1.5" />
                        Send Revision Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
