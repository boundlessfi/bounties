import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const reputation = await ReputationService.getReputation(userId);

        if (!reputation) {
            return NextResponse.json(
                { error: "User reputation not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(reputation);
    } catch (error) {
        console.error("Error fetching reputation:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
