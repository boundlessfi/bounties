import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { WithdrawalService } from "@/lib/services/withdrawal";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, currency, destinationId } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "0.0.0.0";

    const withdrawal = await WithdrawalService.submit(
      user.id,
      amount,
      currency,
      destinationId,
      ip,
    );

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error("Error submitting withdrawal:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Withdrawal failed" },
      { status: 400 },
    );
  }
}
