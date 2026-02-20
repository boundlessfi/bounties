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

    // Input Validation
    if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!currency || typeof currency !== "string") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    if (!destinationId || typeof destinationId !== "string") {
      return NextResponse.json(
        { error: "Invalid destinationId" },
        { status: 400 },
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "0.0.0.0";

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

    let message = "Withdrawal failed";
    let status = 500; // Default to 500

    if (error instanceof Error) {
      message = error.message;
      const err = error as Error & { status?: number; statusCode?: number };
      status =
        err.status ||
        err.statusCode ||
        (error.name === "ValidationError" || error.name === "BadRequestError"
          ? 400
          : 500);
    } else {
      message = String(error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
