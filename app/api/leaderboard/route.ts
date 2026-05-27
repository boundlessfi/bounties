import { NextResponse } from "next/server";
import { getMockLeaderboard } from "@/lib/mock/leaderboard";
import { LeaderboardResponse, ReputationTier } from "@/types/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const tier = searchParams.get("tier") as ReputationTier | null;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { data, total } = getMockLeaderboard(page, limit, tier || undefined);

  const response: LeaderboardResponse = {
    entries: data.map((contributor, index) => ({
      rank: (page - 1) * limit + index + 1,
      previousRank: null, // Mock data doesn't track history yet
      rankChange: 0,
      contributor,
    })),
    totalCount: total,
    currentUserRank: null, // Only relevant if user context is provided
    lastUpdatedAt: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
