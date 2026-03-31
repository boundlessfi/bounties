import { NextRequest, NextResponse } from "next/server";
import { SparkCreditsService } from "@/lib/services/spark-credits";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  const balance = await SparkCreditsService.getBalance(userId);
  return NextResponse.json(balance);
}
