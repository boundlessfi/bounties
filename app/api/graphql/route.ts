import { NextRequest, NextResponse } from "next/server";
import { getMockLeaderboard, getMockUserRank } from "@/lib/mock-leaderboard";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables } = body;

    // Simple mock GraphQL server handling the leaderboard queries
    if (query.includes("query Leaderboard") || query.includes("leaderboard")) {
      const { filters, pagination } = variables || {};
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const tier = filters?.tier;

      const mockData = getMockLeaderboard(page, limit, tier);

      return NextResponse.json({
        data: {
          leaderboard: {
            entries: mockData.data.map((entry, index) => ({
              rank: (page - 1) * limit + index + 1,
              contributor: entry,
            })),
            totalCount: mockData.total,
          },
        },
      });
    }

    if (
      query.includes("query UserLeaderboardRank") ||
      query.includes("userLeaderboardRank")
    ) {
      const { userId } = variables || {};
      const rankData = getMockUserRank(userId);

      return NextResponse.json({
        data: {
          userLeaderboardRank: rankData,
        },
      });
    }

    return NextResponse.json(
      { error: "Query not supported by mock server" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Mock GraphQL Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
