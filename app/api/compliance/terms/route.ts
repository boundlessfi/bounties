import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { TermsService } from "@/lib/services/terms";

export async function GET() {
  try {
    const terms = await TermsService.getCurrentTermsVersion();
    return NextResponse.json(terms);
  } catch (error) {
    console.error("Failed to fetch terms:", error);
    return NextResponse.json(
      { error: "Failed to fetch terms" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { termsVersionId } = await request.json();

    // Validate termsVersionId
    if (!termsVersionId || typeof termsVersionId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing termsVersionId" },
        { status: 400 },
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "0.0.0.0";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const acceptance = await TermsService.acceptTerms(user.id, termsVersionId, {
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json(acceptance);
  } catch (error) {
    console.error("Error accepting terms:", error);
    return NextResponse.json(
      { error: "Failed to accept terms" },
      { status: 500 },
    );
  }
}
