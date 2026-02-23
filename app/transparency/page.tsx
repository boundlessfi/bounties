"use client";

import type { ElementType } from "react";
import { usePlatformStats, useRecentPayouts } from "@/hooks/use-transparency";
import {
  AlertCircle,
  DollarSign,
  Users,
  FolderOpen,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { RecentPayout } from "@/lib/api/transparency";

// Stat Card

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string;
  icon: ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Payout Row

function PayoutRow({ payout }: { payout: RecentPayout }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={payout.contributorAvatar ?? undefined} />
          <AvatarFallback>
            {payout.contributorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">
            {payout.contributorName}
          </p>
          <p className="text-xs text-muted-foreground">{payout.projectName}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {payout.amount.toLocaleString()} {payout.currency}
        </Badge>
        <span className="text-xs text-muted-foreground hidden sm:block">
          {new Date(payout.paidAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// Page

export default function TransparencyPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
    refetch: refetchStats,
  } = usePlatformStats();

  const {
    data: payouts,
    isLoading: payoutsLoading,
    isError: payoutsError,
    refetch: refetchPayouts,
  } = useRecentPayouts(10);

  const statCards = [
    {
      title: "Total Funds Distributed",
      value: statsError
        ? "—"
        : stats
          ? `$${stats.totalFundsDistributed.toLocaleString()}`
          : "$0",
      icon: DollarSign,
    },
    {
      title: "Contributors Paid",
      value: statsError
        ? "—"
        : stats
          ? stats.totalContributorsPaid.toLocaleString()
          : "0",
      icon: Users,
    },
    {
      title: "Projects Funded",
      value: statsError
        ? "—"
        : stats
          ? stats.totalProjectsFunded.toLocaleString()
          : "0",
      icon: FolderOpen,
    },
    {
      title: "Avg. Payout Time",
      value: statsError
        ? "—"
        : stats
          ? `${stats.averagePayoutTimeDays} days`
          : "0 days",
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Transparency
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A real-time look at platform funding activity, contributor payouts,
            and ecosystem growth.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Stats Error */}
        {statsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>
                Failed to load platform stats. {(statsErr as Error)?.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStats()}
                className="w-fit bg-background text-foreground border-border hover:bg-muted"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid - hidden when error so zeros aren't shown */}
        {!statsError && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Platform Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  isLoading={statsLoading}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Payouts */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Recent Payouts
          </h2>

          {payoutsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>Failed to load recent payouts.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchPayouts()}
                  className="w-fit bg-background text-foreground border-border hover:bg-muted"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="pt-4">
                {payoutsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : !payouts || payouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No payouts recorded yet.
                  </p>
                ) : (
                  payouts.map((payout) => (
                    <PayoutRow key={payout.id} payout={payout} />
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
