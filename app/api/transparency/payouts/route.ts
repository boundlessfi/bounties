import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 10;

  // TODO: Replace with real DB queries when backend is ready
  const payouts: {
    id: string;
    contributorName: string;
    contributorAvatar: string | null;
    amount: number;
    currency: string;
    projectName: string;
    paidAt: string;
  }[] = [];

  return NextResponse.json(payouts.slice(0, limit));
}
