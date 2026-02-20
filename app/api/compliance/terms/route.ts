import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { TermsService } from "@/lib/services/terms";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const terms = await TermsService.getCurrentTermsVersion();
    return NextResponse.json(terms);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
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
    const ip = request.headers.get("x-forwarded-for") || "0.0.0.0";
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
