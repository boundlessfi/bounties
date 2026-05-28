"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Milestone, ContributorProgress } from "@/types/bounty";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronRight,
  UserMinus,
  Loader2,
  MessageSquare,
  Coins,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdvanceModel4Contributor,
  useMessageModel4Contributor,
  useReleaseModel4MilestonePayment,
  useRemoveModel4Contributor,
  useViewModel4ContributorSubmissions,
} from "@/hooks/use-bounty-application";

interface Model4MaintainerDashboardProps {
  bountyId: string;
  milestones: Milestone[];
  contributors: ContributorProgress[];
  maxSlots?: number;
  className?: string;
}

export function Model4MaintainerDashboard({
  bountyId,
  milestones,
  contributors: initialContributors,
  maxSlots = 5,
  className,
}: Model4MaintainerDashboardProps) {
  const [contributors, setContributors] = React.useState(initialContributors);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [paidMilestones, setPaidMilestones] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [selectedSubmissionsUserId, setSelectedSubmissionsUserId] =
    React.useState<string | null>(null);
  const [messageUserId, setMessageUserId] = React.useState<string | null>(null);
  const [showAllApplications, setShowAllApplications] = React.useState(false);

  const releasePayment = useReleaseModel4MilestonePayment();
  const advanceContributor = useAdvanceModel4Contributor();
  const removeContributor = useRemoveModel4Contributor();
  const viewSubmissions = useViewModel4ContributorSubmissions();
  const messageContributor = useMessageModel4Contributor();

  React.useEffect(() => {
    setContributors(initialContributors);
  }, [initialContributors]);

  const runAction = async (
    action: string,
    contributor: ContributorProgress,
    mutate: () => Promise<unknown>,
  ) => {
    setLoadingAction(`${action}-${contributor.userId}`);
    try {
      await mutate();
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReleasePayment = async (contributor: ContributorProgress) => {
    const currentMilestoneId = contributor.currentMilestoneId;
    await runAction("Release Payment", contributor, async () => {
      await releasePayment.mutateAsync({
        bountyId,
        contributorId: contributor.userId,
        contributorName: contributor.userName,
        milestoneId: currentMilestoneId,
      });
      setPaidMilestones((current) => {
        const next = new Set(current);
        next.add(`${contributor.userId}:${currentMilestoneId}`);
        return next;
      });
      toast.success(`Released payment for ${contributor.userName}`);
    });
  };

  const handleAdvance = async (contributor: ContributorProgress) => {
    const currentMilestoneIndex = milestones.findIndex(
      (m) => m.id === contributor.currentMilestoneId,
    );
    const nextMilestone = milestones[currentMilestoneIndex + 1];

    if (!nextMilestone) {
      toast.info(`${contributor.userName} is already on the final milestone`);
      return;
    }

    await runAction("Advance", contributor, async () => {
      await advanceContributor.mutateAsync({
        bountyId,
        contributorId: contributor.userId,
        contributorName: contributor.userName,
        milestoneId: nextMilestone.id,
      });
      setContributors((current) =>
        current.map((item) =>
          item.userId === contributor.userId
            ? { ...item, currentMilestoneId: nextMilestone.id }
            : item,
        ),
      );
      toast.success(
        `${contributor.userName} advanced to ${nextMilestone.title}`,
      );
    });
  };

  const handleRemove = async (contributor: ContributorProgress) => {
    await runAction("Remove", contributor, async () => {
      await removeContributor.mutateAsync({
        bountyId,
        contributorId: contributor.userId,
        contributorName: contributor.userName,
      });
      setContributors((current) =>
        current.filter((item) => item.userId !== contributor.userId),
      );
      toast.success(`${contributor.userName} removed from the winner slot`);
    });
  };

  const handleViewSubmissions = async (contributor: ContributorProgress) => {
    await runAction("View Submissions", contributor, async () => {
      await viewSubmissions.mutateAsync({
        bountyId,
        contributorId: contributor.userId,
        contributorName: contributor.userName,
      });
      setSelectedSubmissionsUserId((current) =>
        current === contributor.userId ? null : contributor.userId,
      );
    });
  };

  const handleMessage = async (contributor: ContributorProgress) => {
    await runAction("Message", contributor, async () => {
      await messageContributor.mutateAsync({
        bountyId,
        contributorId: contributor.userId,
        contributorName: contributor.userName,
      });
      setMessageUserId(contributor.userId);
      toast.success(`Opened message draft for ${contributor.userName}`);
    });
  };

  return (
    <Card
      className={cn(
        "border-gray-800 bg-background-card/50 backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="border-b border-gray-800/50 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Maintainer Dashboard
          <span className="text-xs font-normal text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Model 4 Management
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-800/50">
          {contributors.map((contributor) => {
            const currentMilestone = milestones.find(
              (m) => m.id === contributor.currentMilestoneId,
            );
            const currentMilestoneIndex = milestones.findIndex(
              (m) => m.id === contributor.currentMilestoneId,
            );
            const progressPercentage =
              milestones.length === 0
                ? 0
                : Math.max(
                    0,
                    Math.min(
                      100,
                      ((currentMilestoneIndex + 1) / milestones.length) * 100,
                    ),
                  );

            return (
              <div
                key={contributor.userId}
                className="p-4 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Contributor Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="size-10 border border-gray-700">
                      <AvatarImage src={contributor.userAvatarUrl} />
                      <AvatarFallback>
                        {contributor.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h5 className="text-sm font-bold text-gray-100 truncate">
                        {contributor.userName}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">
                          Current:
                        </span>
                        <span className="text-xs text-primary font-medium">
                          {currentMilestone?.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="flex-1 max-w-xs hidden lg:block">
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="text-gray-500 font-bold uppercase tracking-tighter">
                        Progress
                      </span>
                      <span className="text-gray-300">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary shadow-[0_0_5px_rgba(167,249,80,0.2)] transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => handleMessage(contributor)}
                            disabled={loadingAction !== null}
                          >
                            {loadingAction ===
                            `Message-${contributor.userId}` ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <MessageSquare className="size-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-gray-700 hover:bg-gray-800"
                            onClick={() => handleViewSubmissions(contributor)}
                            disabled={loadingAction !== null}
                          >
                            {loadingAction ===
                            `View Submissions-${contributor.userId}`
                              ? "Loading..."
                              : "View Submissions"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Review work</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-bold"
                            onClick={() => handleReleasePayment(contributor)}
                            disabled={loadingAction !== null}
                          >
                            {loadingAction ===
                            `Release Payment-${contributor.userId}` ? (
                              <Loader2 className="size-3 mr-1.5 animate-spin" />
                            ) : (
                              <Coins className="size-3 mr-1.5" />
                            )}
                            {paidMilestones.has(
                              `${contributor.userId}:${contributor.currentMilestoneId}`,
                            )
                              ? "Payment Released"
                              : "Release Payment"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Pay for milestone</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs font-bold"
                            onClick={() => handleAdvance(contributor)}
                            disabled={loadingAction !== null}
                          >
                            {loadingAction ===
                            `Advance-${contributor.userId}` ? (
                              <Loader2 className="size-3 mr-1.5 animate-spin" />
                            ) : (
                              <>
                                Advance <ArrowRight className="size-3 ml-1.5" />
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to next milestone</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                            onClick={() => handleRemove(contributor)}
                            disabled={loadingAction !== null}
                          >
                            {loadingAction ===
                            `Remove-${contributor.userId}` ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <UserMinus className="size-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove from slot</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {selectedSubmissionsUserId === contributor.userId && (
                  <div className="mt-4 rounded-md border border-gray-800 bg-black/20 p-3 text-xs text-gray-400">
                    <div className="font-semibold text-gray-200">
                      Submissions for {contributor.userName}
                    </div>
                    <div className="mt-1">
                      No submitted work is attached to this milestone yet.
                    </div>
                  </div>
                )}

                {messageUserId === contributor.userId && (
                  <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-gray-300">
                    Message draft ready for {contributor.userName}.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        {showAllApplications && (
          <div className="border-t border-gray-800/50 bg-black/20 p-3 text-xs text-gray-400">
            <span className="font-semibold text-gray-200">
              Active applications:
            </span>{" "}
            {contributors.length === 0
              ? "No active contributors in winner slots."
              : contributors
                  .map((contributor) => contributor.userName)
                  .join(", ")}
          </div>
        )}

        <div className="p-3 bg-primary/5 border-t border-gray-800/50 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
            <Trophy className="size-3 text-yellow-500" />
            <span>
              Total Winners Allowed: {contributors.length} / {maxSlots}
            </span>
          </div>
          <div className="h-3 w-px bg-gray-800" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  className="text-[10px] h-auto p-0 text-primary"
                  onClick={() => setShowAllApplications((current) => !current)}
                >
                  {showAllApplications
                    ? "Hide Applications"
                    : "View All Applications"}{" "}
                  <ChevronRight className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Review active contributors</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
