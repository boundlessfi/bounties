import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { VerificationService } from "@/lib/services/verification";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetTier } = await request.json();

    const verificationRequest =
      await VerificationService.createVerificationRequest(user.id, targetTier);

    return NextResponse.json(verificationRequest);
  } catch (error) {
    console.error("Error creating verification request:", error);
    return NextResponse.json(
      {
        error:
          (error as Error).message || "Failed to create verification request",
      },
      { status: 400 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await VerificationService.getVerificationStatus(user.id);
    return NextResponse.json(status);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 },
    );
  }
}
