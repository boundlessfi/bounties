"use client";

import { useContributorReputation } from "@/hooks/use-reputation";
import { useBounties } from "@/hooks/use-bounties";
import { ReputationCard } from "@/components/reputation/reputation-card";
import { CompletionHistory } from "@/components/reputation/completion-history";
import { MyClaims, type MyClaim } from "@/components/reputation/my-claims";
import {
  EarningsSummary,
  type EarningsSummary as EarningsSummaryType,
} from "@/components/reputation/earnings-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

function deriveBountyStatus(bounty: {
  status: string;
  claimExpiresAt?: string | null;
}): "completed" | "in-review" | "active" {
  if (bounty.status === "closed") return "completed";
  if (bounty.status === "claimed" && bounty.claimExpiresAt) {
    const expiry = new Date(bounty.claimExpiresAt);
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return "in-review";
    }
  }
  return "active";
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const {
    data: reputation,
    isLoading,
    error,
  } = useContributorReputation(userId);
  const { data: bountyResponse, isLoading: isBountiesLoading } = useBounties();

  const MAX_MOCK_HISTORY = 50;

  const mockHistory = useMemo(() => {
    if (!reputation) return [];
    const count = Math.min(
      reputation.stats.totalCompleted ?? 0,
      MAX_MOCK_HISTORY,
    );
    return Array(count)
      .fill(null)
      .map((_, i) => ({
        id: `bounty-${i}`,
        bountyId: `b-${i}`,
        bountyTitle: `Implemented feature #${100 + i}`,
        projectName: "Drips Protocol",
        projectLogoUrl: null,
        difficulty: ["BEGINNER", "INTERMEDIATE", "ADVANCED"][i % 3] as
          | "BEGINNER"
          | "INTERMEDIATE"
          | "ADVANCED",
        rewardAmount: 500,
        rewardCurrency: "USDC",
        claimedAt: "2023-01-01T00:00:00Z",
        completedAt: "2024-01-15T12:00:00Z",
        completionTimeHours: 48,
        maintainerRating: 5,
        maintainerFeedback: "Great work!",
        pointsEarned: 150,
      }));
  }, [reputation]);

  const earningsSummary = useMemo<EarningsSummaryType>(() => {
    const currency = reputation?.stats.earningsCurrency ?? "USDC";
    const allBounties = bountyResponse?.data ?? [];
    const userBounties = allBounties.filter((b) => b.claimedBy === userId);

    let totalEarned = 0;
    let pendingAmount = 0;
    const payoutHistory: EarningsSummaryType["payoutHistory"] = [];

    for (const bounty of userBounties) {
      const amount = bounty.rewardAmount ?? 0;
      const status = deriveBountyStatus(bounty);

      if (status === "completed") {
        totalEarned += amount;
        // Use claimExpiresAt as a proxy for payout date, fall back to createdAt.
        const payoutDate = bounty.claimExpiresAt ?? bounty.createdAt;
        payoutHistory.push({ amount, date: payoutDate, status: "completed" });
      } else if (status === "in-review") {
        pendingAmount += amount;
        // claimExpiresAt is guaranteed when status is "in-review"
        payoutHistory.push({
          amount,
          date: bounty.claimExpiresAt!,
          status: "processing",
        });
      } else {
        pendingAmount += amount;
      }
    }

    // If no real claim data, fall back to reputation stats
    if (userBounties.length === 0 && reputation) {
      totalEarned = reputation.stats.totalEarnings;
      // pendingAmount has no reputation-stats equivalent; intentionally left as 0
    }

    return { totalEarned, pendingAmount, currency, payoutHistory };
  }, [bountyResponse?.data, userId, reputation]);

  const myClaims = useMemo<MyClaim[]>(() => {
    const bounties = bountyResponse?.data ?? [];

    return bounties
      .filter((bounty) => bounty.claimedBy === userId)
      .map((bounty) => ({
        bountyId: bounty.id,
        title: bounty.issueTitle,
        status: deriveBountyStatus(bounty),
        rewardAmount: bounty.rewardAmount ?? undefined,
      }));
  }, [bountyResponse?.data, userId]);

  if (isLoading || isBountiesLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-100 md:col-span-1" />
          <Skeleton className="h-100 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's a 404 (Not Found)
    const apiError = error as { status?: number; message?: string };
    const isNotFound =
      apiError?.status === 404 || apiError?.message?.includes("404");

    if (isNotFound) {
      return (
        <div className="container mx-auto py-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We could not find a reputation profile for this user.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      );
    }

    // Generic Error
    return (
      <div className="container mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We encountered an error while loading the profile.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!reputation) {
    return (
      <div className="container mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We could not find a reputation profile for this user.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground"
      >
        <Link href="/">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Reputation Card */}
        <div className="lg:col-span-4 space-y-6">
          <ReputationCard reputation={reputation} />

          {/* Additional Sidebar Info could go here */}
        </div>

        {/* Main Content: Activity & History */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="history"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Bounty History
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="claims"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                My Claims
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-6">
              <h2 className="text-xl font-bold mb-4">Activity History</h2>
              <CompletionHistory
                records={mockHistory}
                description={`Showing the last ${mockHistory.length} completed bounties.`}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="p-8 border rounded-lg text-center text-muted-foreground bg-secondary/5">
                Detailed analytics coming soon.
              </div>
            </TabsContent>

            <TabsContent value="claims" className="mt-6">
              <h2 className="text-xl font-bold mb-4">My Claims</h2>
              <div className="space-y-6">
                <EarningsSummary earnings={earningsSummary} />
                <MyClaims claims={myClaims} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
