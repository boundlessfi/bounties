import { NextResponse } from "next/server";
import { getMockUserRank } from "@/lib/mock/leaderboard";

interface Params {
  params: Promise<{ userId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  // Await params as per Next.js 15+ requirements if applicable, or good practice for future
  const { userId } = await params;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const result = getMockUserRank(userId);

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    rank: result.rank,
    contributor: result.contributor,
    paramsUserId: userId,
  });
}
