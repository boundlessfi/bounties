import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { VerificationService } from "@/lib/services/verification";
import { ComplianceService } from "@/lib/services/compliance";
import { KYCTier } from "@/types/compliance";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetTier } = await request.json();

    const VALID_TIERS = Object.keys(ComplianceService.TIER_CONFIGS).filter(
      (t) => t !== "UNVERIFIED",
    ) as KYCTier[];

    // Validate targetTier
    if (!targetTier || !VALID_TIERS.includes(targetTier as KYCTier)) {
      return NextResponse.json(
        { error: "Invalid or missing targetTier" },
        { status: 400 },
      );
    }

    const verificationRequest =
      await VerificationService.createVerificationRequest(user.id, targetTier);

    return NextResponse.json(verificationRequest);
  } catch (error) {
    console.error("Error creating verification request:", error);

    const isValidationError =
      error instanceof Error &&
      (error.name === "ValidationError" ||
        error.message.includes("Invalid") ||
        error.message.includes("not allowed"));

    return NextResponse.json(
      {
        error:
          (error as Error).message || "Failed to create verification request",
      },
      { status: isValidationError ? 400 : 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await VerificationService.getVerificationStatus(user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to fetch verification status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 },
    );
  }
}
