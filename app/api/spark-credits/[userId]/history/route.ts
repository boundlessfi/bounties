import { NextRequest, NextResponse } from "next/server";
import { SparkCreditsService } from "@/lib/services/spark-credits";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  const { searchParams } = request.nextUrl;
  const rawLimit = Number(searchParams.get("limit") ?? "20");
  const rawOffset = Number(searchParams.get("offset") ?? "0");
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 100)
    : 20;
  const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;
  const history = await SparkCreditsService.getCreditHistory(
    userId,
    limit,
    offset,
  );
  return NextResponse.json(history);
}
