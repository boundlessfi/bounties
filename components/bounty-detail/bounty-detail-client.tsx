"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileCTA, SidebarCTA } from "./bounty-detail-sidebar-cta";
import { HeaderCard } from "./bounty-detail-header-card";
import { DescriptionCard } from "./bounty-detail-description-card";
import { BountyDetailSubmissionsCard } from "./bounty-detail-submissions-card";
import { BountyDetailSkeleton } from "./bounty-detail-bounty-detail-skeleton";
import { useBountyDetail } from "@/hooks/use-bounty-detail";
import { FcfsApprovalPanel } from "@/components/bounty/fcfs-approval-panel";
import { CompetitionJudging } from "@/components/bounty/competition-judging";
import type { CompetitionSubmissionEntry } from "@/components/bounty/competition-judging";
import { EscrowDetailPanel } from "../bounty/escrow-detail-panel";
import { RefundStatusTracker } from "../bounty/refund-status";
import { FeeCalculator } from "../bounty/fee-calculator";
import { useEscrowPool } from "@/hooks/use-escrow";
import { authClient } from "@/lib/auth-client";
import { useDeadlinePassed } from "@/hooks/use-deadline-passed";
import type { CancellationRecord } from "@/types/escrow";
import { MilestoneFunnel } from "@/components/bounty/milestone-funnel";
import {
  MOCK_MODEL4_MILESTONES,
  MOCK_MODEL4_CONTRIBUTORS,
} from "@/lib/mock-model4";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MilestoneSubmissionCard } from "./milestone-submission-card";
import { Model4MaintainerDashboard } from "./model4-maintainer-dashboard";
import type { Milestone, ContributorProgress } from "@/types/bounty";

type BountyData = ReturnType<typeof useBountyDetail>["data"];

/** Returns milestones with mock fallback. Safe for public display since
 * milestones are structural (titles/descriptions), not personal data.
 */
function getMilestones(bounty: BountyData): Milestone[] {
  return bounty?.milestones ?? MOCK_MODEL4_MILESTONES;
}

/** Returns contributorProgress WITHOUT mock fallback — only real API data.
 * Used for the public MilestoneFunnel to prevent mock users (Alice, Bob…)
 * from being displayed to unauthenticated visitors.
 */
function getRealContributors(bounty: BountyData): ContributorProgress[] {
  return bounty?.contributorProgress ?? [];
}

/** Returns full data including mock contributorProgress fallback.
 * Used only in authenticated sections (contributor progress card,
 * maintainer dashboard) where mocks are acceptable during prototyping.
 */
function getFullMilestoneData(bounty: BountyData): {
  milestones: Milestone[];
  contributorProgress: ContributorProgress[];
} {
  return {
    milestones: bounty?.milestones ?? MOCK_MODEL4_MILESTONES,
    contributorProgress:
      bounty?.contributorProgress ?? MOCK_MODEL4_CONTRIBUTORS,
  };
}

export function BountyDetailClient({ bountyId }: { bountyId: string }) {
  const router = useRouter();
  const { data: bounty, isPending, isError, error } = useBountyDetail(bountyId);
  const { data: pool } = useEscrowPool(bountyId);
  const { data: session } = authClient.useSession();
  const [cancellationRecord, setCancellationRecord] =
    useState<CancellationRecord | null>(null);

  const handleCancelled = useCallback((record: CancellationRecord) => {
    setCancellationRecord(record);
  }, []);

  const pastDeadline = useDeadlinePassed(bounty?.bountyWindow?.endDate);

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

  const isCancelled =
    bounty.status === "CANCELLED" || cancellationRecord !== null;

  const isCompetition = bounty.type === "COMPETITION";
  const isCreator =
    (session?.user as { id?: string } | undefined)?.id === bounty.createdBy;
  const isFinalized = bounty.status === "COMPLETED";
  // submissions is present on BountyQuery (single-bounty query) but not on
  // BountyFieldsFragment (list query). The cast is safe here because
  // useBountyDetail returns BountyFieldsFragment & Partial<BountyQuery["bounty"]>.
  const competitionSubmissions =
    (bounty as { submissions?: CompetitionSubmissionEntry[] | null })
      .submissions ?? [];

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        <HeaderCard bounty={bounty} />
        <DescriptionCard description={bounty.description} />

        {bounty.type === "MULTI_WINNER_MILESTONE" && (
          <Card className="border-gray-800 bg-background-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-gray-800/50 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Milestone Funnel
                <span className="text-xs font-normal text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Multi-Winner
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* contributors is intentionally real-data-only: mock users
                  (Alice, Bob…) must not be shown to unauthenticated visitors */}
              <MilestoneFunnel
                milestones={getMilestones(bounty)}
                contributors={getRealContributors(bounty)}
              />
            </CardContent>
          </Card>
        )}

        {bounty.type === "MULTI_WINNER_MILESTONE" &&
          session?.user?.id &&
          (() => {
            const { milestones, contributorProgress } =
              getFullMilestoneData(bounty);
            const myProgress = contributorProgress.find(
              (c) => c.userId === session.user.id,
            );
            if (!myProgress) return null;
            return (
              <MilestoneSubmissionCard
                milestones={milestones}
                contributorProgress={myProgress}
              />
            );
          })()}

        {bounty.type === "MULTI_WINNER_MILESTONE" &&
          session?.user?.id === bounty.createdBy &&
          (() => {
            const { milestones, contributorProgress } =
              getFullMilestoneData(bounty);
            return (
              <Model4MaintainerDashboard
                milestones={milestones}
                contributors={contributorProgress}
              />
            );
          })()}

        {!isCancelled && pool && <EscrowDetailPanel poolId={bountyId} />}
        <RefundStatusTracker bountyId={bountyId} isCancelled={isCancelled} />
        {bounty.type !== "FIXED_PRICE" && !isCompetition && (
          <BountyDetailSubmissionsCard bounty={bounty} />
        )}
        {bounty.type === "FIXED_PRICE" && <FcfsApprovalPanel bounty={bounty} />}
        {isCompetition && isCreator && (pastDeadline || isFinalized) && (
          <CompetitionJudging
            bountyId={bountyId}
            submissions={competitionSubmissions}
            isFinalized={isFinalized}
            totalReward={bounty.rewardAmount}
            currency={bounty.rewardCurrency}
          />
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-4">
          <SidebarCTA bounty={bounty} onCancelled={handleCancelled} />
          <FeeCalculator />
        </div>
      </aside>

      {/* Mobile sticky CTA */}
      <MobileCTA bounty={bounty} onCancelled={handleCancelled} />
    </div>
  );
}
