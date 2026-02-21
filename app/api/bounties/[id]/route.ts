import { NextResponse } from "next/server";
import { getBountyById } from "@/lib/mock-bounty";
import { BountyLogic } from "@/lib/logic/bounty-logic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Simulate network delay in development only
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const { id } = await params;
  const bounty = getBountyById(id);

  if (!bounty) {
    return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
  }

  const processed = BountyLogic.processBountyStatus(bounty);

  return NextResponse.json(processed);
}
