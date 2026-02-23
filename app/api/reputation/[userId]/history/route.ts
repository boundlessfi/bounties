import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : undefined;
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : undefined;

    const resp = await ReputationService.getCompletionHistory(
      userId,
      limit ?? 10,
      offset ?? 0,
    );
    return NextResponse.json(resp);
  } catch (err) {
    console.error("Error fetching reputation history:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
