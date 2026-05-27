import { NextResponse } from "next/server";
import { getMockLeaderboard } from "@/lib/mock/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get("count") || "5");

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Get top N contributors
  const { data } = getMockLeaderboard(1, count);

  return NextResponse.json(data);
}
