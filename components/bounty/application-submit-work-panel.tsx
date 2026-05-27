"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, Send, AlertTriangle } from "lucide-react";
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
import { useSubmitApplicationWork } from "@/hooks/use-bounty-application";
import { toast } from "sonner";

interface ApplicationSubmitWorkPanelProps {
  bountyId: string;
  contributorAddress: string;
  latestRevisionFeedback?: string;
}

export function ApplicationSubmitWorkPanel({
  bountyId,
  contributorAddress,
  latestRevisionFeedback,
}: ApplicationSubmitWorkPanelProps) {
  const [workCid, setWorkCid] = useState("");

  const { mutate: submitWork, isPending } = useSubmitApplicationWork();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workCid.trim()) return;

    submitWork(
      {
        bountyId,
        contributorAddress,
        workCid,
      },
      {
        onSuccess: () => {
          toast.success("Deliverable submitted for review.");
          setWorkCid("");
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Submission failed.",
          ),
      },
    );
  };

  return (
    <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
      <CardHeader className="border-b border-primary/10 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Upload className="size-5 text-primary" />
          {latestRevisionFeedback ? "Resubmit Your Work" : "Submit Your Work"}
        </CardTitle>
        <CardDescription>
          {latestRevisionFeedback
            ? "The reviewer has requested changes. Please address the feedback below and resubmit."
            : 'Provide the deliverables for this bounty. This will move the bounty to "In Review" status.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Revision Feedback Banner */}
        {latestRevisionFeedback && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-amber-400 mb-1">
                  Revision Requested
                </h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {latestRevisionFeedback}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="work-cid">
              Deliverable IPFS CID or Link{" "}
              <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="work-cid"
                placeholder="Qm..."
                value={workCid}
                onChange={(e) => setWorkCid(e.target.value)}
                className="pl-9 bg-background-card"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Please provide the IPFS Content Identifier (CID) for your
              deliverable bundle.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!workCid.trim() || isPending}
          >
            <Send className="size-4 mr-2" />
            {isPending
              ? "Submitting..."
              : latestRevisionFeedback
                ? "Resubmit Deliverable"
                : "Submit Deliverable"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
