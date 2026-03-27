"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  BountyApplicationRecord,
  BountySubmissionRecord,
} from "@/hooks/use-bounty-application";

interface SubmissionApprovalPanelProps {
  submission: BountySubmissionRecord;
  selectedApplication?: BountyApplicationRecord;
  escrowLocked: boolean;
  onApprove: (points: number) => Promise<void> | void;
  onRequestRevision: (feedback: string) => Promise<void> | void;
  isApproving?: boolean;
  isRequestingRevision?: boolean;
}

function normalizeWorkCidLink(workCid: string) {
  const trimmed = workCid.trim();

  if (/^https?:\/\//i.test(trimmed) || /^ipfs:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://ipfs.io/ipfs/${trimmed}`;
}

export function SubmissionApprovalPanel({
  submission,
  selectedApplication,
  escrowLocked,
  onApprove,
  onRequestRevision,
  isApproving = false,
  isRequestingRevision = false,
}: SubmissionApprovalPanelProps) {
  const [points, setPoints] = useState("25");
  const [feedback, setFeedback] = useState("");
  const normalizedWorkCidLink = normalizeWorkCidLink(submission.workCid);
  const parsedPoints = Number(points);
  const isValidPoints = Number.isInteger(parsedPoints) && parsedPoints > 0;

  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>Submission Approval Panel</CardTitle>
        <CardDescription>
          Review the selected contributor&apos;s deliverable and release escrow
          when it is ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-border/70 bg-background/40 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">
                {selectedApplication?.applicantName ?? submission.contributorName}
              </p>
              <p className="text-sm text-muted-foreground">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
            <Badge variant={escrowLocked ? "secondary" : "outline"}>
              {escrowLocked ? "Escrow locked" : "Escrow released"}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Work CID</p>
            <a
              href={normalizedWorkCidLink}
              target="_blank"
              rel="noreferrer"
              className="break-all text-sm text-primary hover:underline"
            >
              {submission.workCid}
            </a>
          </div>

          {submission.notes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Contributor notes</p>
              <p className="text-sm">{submission.notes}</p>
            </div>
          )}

          {submission.feedback && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
              Latest review feedback: {submission.feedback}
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="reputation-points">Reputation points</Label>
            <Input
              id="reputation-points"
              inputMode="numeric"
              value={points}
              onChange={(event) => setPoints(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="revision-feedback">Revision feedback</Label>
            <Textarea
              id="revision-feedback"
              placeholder="Call out what should be revised before approval."
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void onRequestRevision(feedback)}
            disabled={!feedback.trim() || isRequestingRevision}
          >
            {isRequestingRevision ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            Request Revisions
          </Button>
          <Button
            type="button"
            onClick={() => void onApprove(parsedPoints)}
            disabled={!isValidPoints || isApproving}
          >
            {isApproving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Approve & Release Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
