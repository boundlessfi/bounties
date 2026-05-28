"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  useDeclineApplicant,
  useSelectApplicant,
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
  const [visibleApplications, setVisibleApplications] = useState(applications);
  const [declineTarget, setDeclineTarget] = useState<{
    application: Application;
    index: number;
  } | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const { mutate: selectApplicant, isPending: isSelecting } =
    useSelectApplicant();
  const { mutate: declineApplicant, isPending: isDeclining } =
    useDeclineApplicant();

  useEffect(() => {
    setVisibleApplications(applications);
  }, [applications]);

  const handleSelectApplicant = (applicantAddress: string) => {
    selectApplicant({
      bountyId,
      creatorAddress,
      applicantAddress,
    });
  };

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const handleDeclineApplicant = () => {
    if (!declineTarget) return;

    const { application, index } = declineTarget;
    const reason = declineReason.trim();
    const wasSelectedForCompare = selectedForCompare.includes(application.id);

    setVisibleApplications((current) =>
      current.filter((item) => item.id !== application.id),
    );
    setSelectedForCompare((current) =>
      current.filter((id) => id !== application.id),
    );
    setDeclineTarget(null);
    setDeclineReason("");

    declineApplicant(
      {
        bountyId,
        applicantAddress: application.applicantAddress,
        reason,
      },
      {
        onSuccess: () => {
          toast.success("Application declined.");
        },
        onError: (error) => {
          setVisibleApplications((current) => {
            if (current.some((item) => item.id === application.id)) {
              return current;
            }
            const next = [...current];
            next.splice(Math.max(index, 0), 0, application);
            return next;
          });
          if (wasSelectedForCompare) {
            setSelectedForCompare((current) =>
              current.includes(application.id) || current.length >= 2
                ? current
                : [...current, application.id],
            );
          }
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to decline application.",
          );
        },
      },
    );
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
                  !selectedForCompare.includes(app.id) &&
                  selectedForCompare.length >= 2
                }
              >
                {selectedForCompare.includes(app.id) ? "Comparing" : "Compare"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleSelectApplicant(app.applicantAddress)}
              disabled={isSelecting || isDeclining}
            >
              <CheckCircle className="size-4 mr-1" /> Select
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() =>
                setDeclineTarget({
                  application: app,
                  index: visibleApplications.findIndex(
                    (item) => item.id === app.id,
                  ),
                })
              }
              disabled={isSelecting || isDeclining}
            >
              <XCircle className="size-4 mr-1" /> Decline
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
          Review Applications ({visibleApplications.length})
        </h2>
        {selectedForCompare.length > 0 && (
          <Badge variant="outline" className="text-sm">
            {selectedForCompare.length}/2 Selected for Comparison
          </Badge>
        )}
      </div>

      {visibleApplications.length === 0 ? (
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
            {visibleApplications
              .filter((app) => selectedForCompare.includes(app.id))
              .map((app) => renderApplicationCard(app, false))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleApplications.map((app) => renderApplicationCard(app, false))}
        </div>
      )}

      <AlertDialog
        open={declineTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeclineTarget(null);
            setDeclineReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the applicant from the review queue. You can include
              a short reason for the applicant notification cache.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
            placeholder="Optional reason"
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeclining}>Cancel</AlertDialogCancel>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeclineApplicant}
              disabled={isDeclining}
            >
              Decline applicant
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
