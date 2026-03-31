"use client";

import { ContributorReputationWithMetrics } from "@/types/reputation";
import { XpDisplay } from "./xp-display";
import { SkillRadarChart } from "./skill-radar-chart";
import { ContributionHeatmap } from "./contribution-heatmap";

interface ReputationDashboardProps {
  reputation: ContributorReputationWithMetrics;
}

export function ReputationDashboard({ reputation }: ReputationDashboardProps) {
  const { metrics } = reputation;

  // Guard against missing metrics
  if (!metrics) {
    return (
      <div className="p-8 border rounded-lg text-center text-muted-foreground">
        <p>Metrics data is not available for this user.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Display */}
      <XpDisplay xp={metrics.xp} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar Chart */}
        <SkillRadarChart skills={metrics.skills} />

        {/* Contribution Stats */}
        <div className="space-y-6">
          <ContributionHeatmap
            contributionHistory={metrics.contributionHistory}
          />
        </div>
      </div>
    </div>
  );
}
