"use client";

import { useState } from "react";
import { Upload, Link as LinkIcon, Send } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubmitApplicationWork } from "@/hooks/use-bounty-application";

interface ApplicationSubmitWorkPanelProps {
  bountyId: string;
  contributorAddress: string;
  latestRevisionFeedback?: string | null;
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

    submitWork({
      bountyId,
      contributorAddress,
      workCid,
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
      <CardHeader className="border-b border-primary/10 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Upload className="size-5 text-primary" />
          Submit Your Work
        </CardTitle>
        <CardDescription>
          Provide the deliverables for this bounty. This will move the bounty to
          &quot;In Review&quot; status.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {latestRevisionFeedback && (
          <Alert
            variant="destructive"
            className="mb-6 bg-amber-500/10 text-amber-500 border-amber-500/20"
          >
            <AlertTitle className="font-semibold text-amber-400">
              Revisions Requested
            </AlertTitle>
            <AlertDescription className="mt-2 text-sm opacity-90 whitespace-pre-wrap">
              {latestRevisionFeedback}
            </AlertDescription>
          </Alert>
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
            {isPending ? "Submitting..." : "Submit Deliverable"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
