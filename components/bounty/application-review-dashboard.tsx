"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  ArrowRight,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import {
  useSelectApplicant,
  useDeclineApplicant,
} from "@/hooks/use-bounty-application";

export interface Application {
  id: string;
  applicantAddress: string;
  applicantName?: string;
  proposal: {
    approach: string;
    estimatedTimeline: string;
    relevantExperience: string;
    portfolioUrl?: string;
  };
  reputation: {
    score: number;
    tier: string;
    completionStats: string;
  };
  createdAt: string;
}

interface ApplicationReviewDashboardProps {
  bountyId: string;
  creatorAddress: string;
  applications: Application[];
}

export function ApplicationReviewDashboard({
  bountyId,
  creatorAddress,
  applications,
}: ApplicationReviewDashboardProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const { mutate: selectApplicant, isPending: isSelecting } =
    useSelectApplicant();
  const { mutate: declineApplicant, isPending: isDeclining } =
    useDeclineApplicant();

  const [declineState, setDeclineState] = useState<{
    isOpen: boolean;
    address: string;
    reason: string;
  }>({ isOpen: false, address: "", reason: "" });

  const handleSelectApplicant = (applicantAddress: string) => {
    selectApplicant({
      bountyId,
      creatorAddress,
      applicantAddress,
    });
  };

  const handleDeclineSubmit = () => {
    if (!declineState.address) return;
    declineApplicant(
      {
        bountyId,
        creatorAddress,
        applicantAddress: declineState.address,
        reason: declineState.reason,
      },
      {
        onSuccess: () => {
          toast.success("Applicant declined successfully");
          const app = applications.find(
            (a) => a.applicantAddress === declineState.address,
          );
          if (app) {
            setSelectedForCompare((prev) => prev.filter((id) => id !== app.id));
          }
          setDeclineState({ isOpen: false, address: "", reason: "" });
        },
      },
    );
  };

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const renderApplicationCard = (app: Application, isCompact = false) => (
    <Card
      key={app.id}
      className="border-gray-800 bg-background-card/50 backdrop-blur-sm relative overflow-hidden transition-all hover:border-gray-700"
    >
      <CardHeader className="pb-3 border-b border-gray-800/50">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              {app.applicantName ||
                `Applicant ${app.applicantAddress.slice(0, 8)}...`}
              <Badge
                variant="outline"
                className="text-xs bg-primary/10 text-primary border-primary/20"
              >
                {app.reputation.tier}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 text-yellow-500" />
                {app.reputation.score} Rep
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="size-3.5 text-emerald-500" />
                {app.reputation.completionStats}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5 text-blue-400" />
                {app.proposal.estimatedTimeline}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isCompact && (
              <Button
                variant={
                  selectedForCompare.includes(app.id) ? "secondary" : "outline"
                }
                size="sm"
                onClick={() => toggleCompare(app.id)}
                disabled={
                  (!selectedForCompare.includes(app.id) &&
                    selectedForCompare.length >= 2) ||
                  isSelecting ||
                  isDeclining
                }
              >
                {selectedForCompare.includes(app.id) ? "Comparing" : "Compare"}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setDeclineState({
                  isOpen: true,
                  address: app.applicantAddress,
                  reason: "",
                })
              }
              disabled={isSelecting || isDeclining}
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
            >
              <XCircle className="size-4 mr-1" /> Decline
            </Button>
            <Button
              size="sm"
              onClick={() => handleSelectApplicant(app.applicantAddress)}
              disabled={isSelecting || isDeclining}
            >
              <CheckCircle className="size-4 mr-1" /> Select
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-sm">
        <div>
          <h4 className="font-semibold text-gray-300 mb-1">Approach</h4>
          <p className="text-gray-400 line-clamp-3 leading-relaxed">
            {app.proposal.approach}
          </p>
        </div>
        {!isCompact && (
          <div>
            <h4 className="font-semibold text-gray-300 mb-1">Experience</h4>
            <p className="text-gray-400 line-clamp-2 leading-relaxed">
              {app.proposal.relevantExperience}
            </p>
            {app.proposal.portfolioUrl &&
              (app.proposal.portfolioUrl.startsWith("http://") ||
                app.proposal.portfolioUrl.startsWith("https://")) && (
                <a
                  href={app.proposal.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
                >
                  View Portfolio <ArrowRight className="size-3" />
                </a>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="size-5 text-primary" />
          Review Applications ({applications.length})
        </h2>
        {selectedForCompare.length > 0 && (
          <Badge variant="outline" className="text-sm">
            {selectedForCompare.length}/2 Selected for Comparison
          </Badge>
        )}
      </div>

      {applications.length === 0 ? (
        <Card className="border-dashed border-gray-800 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">
              No applications yet
            </h3>
            <p className="text-gray-500 max-w-sm mt-1">
              Applications will appear here once contributors submit their
              proposals.
            </p>
          </CardContent>
        </Card>
      ) : selectedForCompare.length === 2 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-800/30 p-3 rounded-lg">
            <span className="font-medium">Comparison Mode</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedForCompare([])}
            >
              Exit Comparison
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications
              .filter((app) => selectedForCompare.includes(app.id))
              .map((app) => renderApplicationCard(app, false))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => renderApplicationCard(app, false))}
        </div>
      )}

      <AlertDialog
        open={declineState.isOpen}
        onOpenChange={(isOpen) =>
          setDeclineState((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent className="bg-gray-900 border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Application</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to decline this applicant? You can
              optionally provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-2">
            <Label
              htmlFor="decline-reason"
              className="text-sm font-medium text-gray-300"
            >
              Reason (Optional)
            </Label>
            <Textarea
              id="decline-reason"
              placeholder="e.g., Lacking required specific experience..."
              value={declineState.reason}
              onChange={(e) =>
                setDeclineState((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="bg-gray-800/50 border-gray-700 resize-none"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeclining}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeclineSubmit}
              disabled={isDeclining}
            >
              {isDeclining ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                "Decline Applicant"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
