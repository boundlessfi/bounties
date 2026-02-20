import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { ComplianceService } from "@/lib/services/compliance";
import { TermsService } from "@/lib/services/terms";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const compliance = await ComplianceService.getUserCompliance(user.id);
    const remaining = await ComplianceService.getRemainingLimits(user.id);
    const termsStatus = await TermsService.getUserTermsStatus(user.id);
    const nextTier = ComplianceService.getNextTier(compliance.currentTier);

    return NextResponse.json({
      compliance,
      remaining,
      termsStatus,
      nextTier,
    });
  } catch (error) {
    console.error("Error fetching compliance status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
