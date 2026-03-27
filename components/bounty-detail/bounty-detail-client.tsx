"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BellRing,
  Loader2,
  LockKeyhole,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MobileCTA, SidebarCTA } from "./bounty-detail-sidebar-cta";
import { HeaderCard } from "./bounty-detail-header-card";
import { DescriptionCard } from "./bounty-detail-description-card";
import { BountyDetailSkeleton } from "./bounty-detail-bounty-detail-skeleton";
import { useBountyDetail } from "@/hooks/use-bounty-detail";
import { authClient } from "@/lib/auth-client";
import { useBountyApplication } from "@/hooks/use-bounty-application";
import { ApplicationDialog } from "@/components/bounty/application-dialog";
import { ApplicationReviewDashboard } from "@/components/bounty/application-review-dashboard";
import { SubmissionApprovalPanel } from "@/components/bounty/submission-approval-panel";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExtendedUser {
  id: string;
  name?: string | null;
  image?: string | null;
  organizations?: string[];
}

export function BountyDetailClient({ bountyId }: { bountyId: string }) {
  const router = useRouter();
  const { data: bounty, isPending, isError, error } = useBountyDetail(bountyId);
  const { data: session } = authClient.useSession();
  const currentUser = (session?.user as ExtendedUser | undefined) ?? null;
  const [workCid, setWorkCid] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");

  const flowBounty = bounty ?? {
    id: bountyId,
    status: "OPEN",
    createdBy: "",
    organizationId: "",
    rewardAmount: 0,
  };

  const applicationFlow = useBountyApplication({
    bounty: {
      id: flowBounty.id,
      status: flowBounty.status,
      createdBy: flowBounty.createdBy,
      organizationId: flowBounty.organizationId,
      rewardAmount: flowBounty.rewardAmount,
    },
    currentUser,
  });

  if (isPending) return <BountyDetailSkeleton />;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center">
          <AlertCircle className="size-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-200">
          Failed to load bounty
        </h2>
        <p className="text-gray-400 max-w-sm text-sm">
          {error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."}
        </p>
        <Button
          variant="outline"
          className="border-gray-700 hover:bg-gray-800 mt-2"
          onClick={() => router.push("/bounty")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to bounties
        </Button>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="size-16 rounded-full bg-gray-800/50 flex items-center justify-center">
          <AlertCircle className="size-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-200">Bounty not found</h2>
        <p className="text-gray-400 max-w-sm text-sm">
          This bounty may have been removed or doesn&apos;t exist.
        </p>
        <Button
          variant="outline"
          className="border-gray-700 hover:bg-gray-800 mt-2"
          onClick={() => router.push("/bounty")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to bounties
        </Button>
      </div>
    );
  }

  const renderPrimaryAction = () => {
    if (!applicationFlow.isReady) {
      return (
        <Button className="w-full h-11 font-bold tracking-wide" size="lg" disabled>
          <Loader2 className="size-4 animate-spin" />
          Loading flow
        </Button>
      );
    }

    if (applicationFlow.canApply) {
      return (
        <ApplicationDialog
          bountyTitle={bounty.title}
          onApply={async (proposal) => {
            try {
              await applicationFlow.applyForBounty(proposal);
              toast.success("Application submitted", {
                description: "Your proposal is now ready for creator review.",
              });
              return true;
            } catch (submitError) {
              toast.error(
                submitError instanceof Error
                  ? submitError.message
                  : "Failed to submit application.",
              );
              return false;
            }
          }}
          trigger={
            <Button className="w-full h-11 font-bold tracking-wide" size="lg">
              Apply for bounty
            </Button>
          }
        />
      );
    }

    if (applicationFlow.currentUserApplication) {
      return (
        <div className="space-y-2">
          <Button
            className="w-full h-11 font-bold tracking-wide"
            size="lg"
            disabled
          >
            Application {applicationFlow.currentUserApplication.status}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            We&apos;ll update this view when the creator reviews your proposal.
          </p>
        </div>
      );
    }

    if (applicationFlow.isCreator) {
      return (
        <div className="space-y-2">
          <Button className="w-full h-11 font-bold tracking-wide" size="lg" disabled>
            Creator review mode
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Compare applications below and select one contributor to lock escrow.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Button className="w-full h-11 font-bold tracking-wide" size="lg" disabled>
          {applicationFlow.selectedApplicantId
            ? "Applicant selected"
            : "Waiting for access"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          This bounty is no longer accepting new applications.
        </p>
      </div>
    );
  };

  const handleSubmitWork = async () => {
    try {
      await applicationFlow.submitWork({
        workCid,
        notes: submissionNotes,
      });
      toast.success("Work submitted", {
        description: "The bounty moved into review for creator approval.",
      });
      setWorkCid("");
      setSubmissionNotes("");
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit work.",
      );
    }
  };

  const notificationCards = applicationFlow.notifications.map((notification) => (
    <Card key={notification.id} className="bg-card/70">
      <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <BellRing className="mt-0.5 size-4 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => applicationFlow.markNotificationRead(notification.id)}
        >
          Dismiss
        </Button>
      </CardContent>
    </Card>
  ));

  const canSubmitOrResubmit =
    applicationFlow.isSelectedApplicant &&
    (!applicationFlow.submission ||
      applicationFlow.submission.status === "revision_requested");

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 min-w-0 space-y-6">
        <HeaderCard bounty={bounty} />
        <DescriptionCard description={bounty.description} />
        {notificationCards}

        {applicationFlow.isCreator && (
          <ApplicationReviewDashboard
            applications={applicationFlow.applications}
            selectedApplicantId={applicationFlow.selectedApplicantId}
            onSelect={async (applicantId) => {
              try {
                await applicationFlow.selectApplicant(applicantId);
                toast.success("Applicant selected", {
                  description:
                    "Escrow is now locked and the contributor has the exclusive claim.",
                });
              } catch (selectionError) {
                toast.error(
                  selectionError instanceof Error
                    ? selectionError.message
                    : "Failed to select applicant.",
                );
              }
            }}
            onDecline={async (applicantId) => {
              try {
                await applicationFlow.declineApplicant(applicantId);
                toast.success("Application declined");
              } catch (declineError) {
                toast.error(
                  declineError instanceof Error
                    ? declineError.message
                    : "Failed to decline applicant.",
                );
              }
            }}
            isSelecting={applicationFlow.isSelectingApplicant}
            isDeclining={applicationFlow.isDecliningApplicant}
          />
        )}

        {applicationFlow.selectedApplication && (
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Exclusive Claim Status</CardTitle>
              <CardDescription>
                Selection locks escrow and assigns this bounty to one
                contributor until review is complete.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    Selected: {applicationFlow.selectedApplication.applicantName}
                  </Badge>
                  <Badge
                    variant={applicationFlow.escrowLocked ? "secondary" : "outline"}
                  >
                    {applicationFlow.escrowLocked
                      ? "Escrow locked"
                      : "Escrow released"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Timeline: {applicationFlow.selectedApplication.proposal.timeline}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="size-4" />
                {applicationFlow.escrowLocked
                  ? "Funds are reserved for the selected contributor."
                  : "Approval released the bounty escrow."}
              </div>
            </CardContent>
          </Card>
        )}

        {canSubmitOrResubmit && (
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Submit Work</CardTitle>
              <CardDescription>
                Send the final IPFS CID or hosted deliverable link to move the
                bounty into review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationFlow.submission?.feedback && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                  {applicationFlow.submission.feedback}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="work-cid">Deliverable CID / URL</Label>
                <Input
                  id="work-cid"
                  placeholder="ipfs://... or https://..."
                  value={workCid}
                  onChange={(event) => setWorkCid(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submission-notes">Submission Notes</Label>
                <Textarea
                  id="submission-notes"
                  placeholder="Summarize what was delivered, testing notes, and any follow-up context."
                  value={submissionNotes}
                  onChange={(event) => setSubmissionNotes(event.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => void handleSubmitWork()}
                  disabled={!workCid.trim() || applicationFlow.isSubmittingWork}
                >
                  {applicationFlow.isSubmittingWork ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {applicationFlow.submission?.status === "revision_requested"
                    ? "Resubmit Work"
                    : "Submit Work"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {applicationFlow.submission && !applicationFlow.isCreator && (
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>
                Track creator review progress after work is delivered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {applicationFlow.submission.status.replace("_", " ")}
                </Badge>
                {typeof applicationFlow.submission.pointsAwarded === "number" && (
                  <Badge variant="outline">
                    +{applicationFlow.submission.pointsAwarded} reputation
                  </Badge>
                )}
              </div>
              <a
                href={applicationFlow.submission.workCid}
                target="_blank"
                rel="noreferrer"
                className="block break-all text-sm text-primary hover:underline"
              >
                {applicationFlow.submission.workCid}
              </a>
              {applicationFlow.submission.feedback && !canSubmitOrResubmit && (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                  {applicationFlow.submission.feedback}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {applicationFlow.isCreator && applicationFlow.submission && (
          <SubmissionApprovalPanel
            submission={applicationFlow.submission}
            selectedApplication={applicationFlow.selectedApplication}
            escrowLocked={applicationFlow.escrowLocked}
            onApprove={async (points) => {
              try {
                await applicationFlow.approveSubmission(points);
                toast.success("Submission approved", {
                  description:
                    "Escrow has been released to the selected contributor.",
                });
              } catch (approvalError) {
                toast.error(
                  approvalError instanceof Error
                    ? approvalError.message
                    : "Failed to approve submission.",
                );
              }
            }}
            onRequestRevision={async (feedback) => {
              try {
                await applicationFlow.requestRevision(feedback);
                toast.success("Revision requested");
              } catch (revisionError) {
                toast.error(
                  revisionError instanceof Error
                    ? revisionError.message
                    : "Failed to request revision.",
                );
              }
            }}
            isApproving={applicationFlow.isApprovingSubmission}
            isRequestingRevision={applicationFlow.isRequestingRevision}
          />
        )}
      </div>

      <aside className="w-full lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-4">
          <SidebarCTA bounty={bounty} actionSlot={renderPrimaryAction()} />
        </div>
      </aside>

      <MobileCTA bounty={bounty} actionSlot={renderPrimaryAction()} />
    </div>
  );
}
