"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  GitCompareArrows,
  ShieldBan,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BountyApplicationRecord } from "@/hooks/use-bounty-application";

interface ApplicationReviewDashboardProps {
  applications: BountyApplicationRecord[];
  selectedApplicantId?: string;
  onSelect: (applicantId: string) => Promise<void> | void;
  onDecline: (applicantId: string) => Promise<void> | void;
  isSelecting?: boolean;
  isDeclining?: boolean;
}

const statusTone: Record<BountyApplicationRecord["status"], string> = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  selected: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  declined: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  rejected: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

export function ApplicationReviewDashboard({
  applications,
  selectedApplicantId,
  onSelect,
  onDecline,
  isSelecting = false,
  isDeclining = false,
}: ApplicationReviewDashboardProps) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const comparedApplications = useMemo(
    () =>
      compareIds
        .map((id) => applications.find((application) => application.id === id))
        .filter(Boolean) as BountyApplicationRecord[],
    [applications, compareIds],
  );

  const toggleCompare = (applicationId: string) => {
    setCompareIds((current) => {
      if (current.includes(applicationId)) {
        return current.filter((id) => id !== applicationId);
      }

      if (current.length === 2) {
        return [current[1], applicationId];
      }

      return [...current, applicationId];
    });
  };

  if (applications.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle>Application Review</CardTitle>
          <CardDescription>
            Applications will appear here once contributors start proposing their
            approach.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Application Review Dashboard</CardTitle>
          <CardDescription>
            Compare proposals, reputation, and delivery history before
            assigning the exclusive claim.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {applications.map((application) => {
            const isSelected = selectedApplicantId === application.applicantId;
            const comparisonActive = compareIds.includes(application.id);

            return (
              <div
                key={application.id}
                className="rounded-xl border border-border/70 bg-background/40 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">
                        {application.applicantName}
                      </h3>
                      <Badge
                        className={statusTone[application.status]}
                        variant="outline"
                      >
                        {application.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="secondary">
                        {application.insights.reputationScore} pts
                      </Badge>
                      <Badge variant="outline">
                        {application.insights.tier}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {application.proposal.approach}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" />
                        Timeline: {application.proposal.timeline}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="size-3.5" />
                        {application.insights.completedBounties} completed
                      </span>
                      <span>
                        {application.insights.completionRate}% completion rate
                      </span>
                      <span>
                        {application.insights.averageDeliveryDays}d avg delivery
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 line-clamp-2">
                      {application.proposal.relevantExperience}
                    </p>

                    {application.proposal.portfolioLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {application.proposal.portfolioLinks.map((link) => (
                          <a
                            key={link}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[240px] lg:justify-end">
                    <Button
                      type="button"
                      variant={comparisonActive ? "secondary" : "outline"}
                      onClick={() => toggleCompare(application.id)}
                    >
                      <GitCompareArrows className="size-4" />
                      {comparisonActive ? "Comparing" : "Compare"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void onDecline(application.applicantId)}
                      disabled={
                        isDeclining || application.status === "declined" || isSelected
                      }
                    >
                      <ShieldBan className="size-4" />
                      Decline
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void onSelect(application.applicantId)}
                      disabled={
                        isSelecting ||
                        Boolean(selectedApplicantId && !isSelected) ||
                        application.status === "selected"
                      }
                    >
                      <CheckCircle2 className="size-4" />
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {comparedApplications.length === 2 && (
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle>Side-by-Side Comparison</CardTitle>
            <CardDescription>
              Review the strongest differences before making the final
              selection.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {comparedApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-border/70 bg-background/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{application.applicantName}</h3>
                  <Badge variant="secondary">
                    {application.insights.tier}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Approach</p>
                  <p>{application.proposal.approach}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Timeline</p>
                  <p>{application.proposal.timeline}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Relevant experience</p>
                  <p>{application.proposal.relevantExperience}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-muted-foreground">Reputation</p>
                    <p className="font-semibold">
                      {application.insights.reputationScore}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-muted-foreground">Completion rate</p>
                    <p className="font-semibold">
                      {application.insights.completionRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
