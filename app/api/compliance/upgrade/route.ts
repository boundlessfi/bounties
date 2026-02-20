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

        const verificationRequest = await VerificationService.createVerificationRequest(
            user.id,
            targetTier
        );

        return NextResponse.json(verificationRequest);
    } catch (error: unknown) {
        console.error("Error creating verification request:", error);
        const message = error instanceof Error ? error.message : "Failed to create verification request";
        return NextResponse.json(
            { error: message },
            { status: 400 }
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
    } catch {
        return NextResponse.json({ error: "Failed to fetch verification status" }, { status: 500 });
    }
}
