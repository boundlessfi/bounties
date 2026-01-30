import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";
import { getCurrentUser } from "@/lib/server-auth"; // Assuming this exists or using a mock

export async function GET(request: NextRequest) {
    try {
        // In a real app, strict auth check here
        const user = await getCurrentUser();

        if (!user) {
            // Fallback for demo/mock if no auth system is fully coupled yet
            // In production this is 401
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reputation = await ReputationService.getReputation(user.id);

        if (!reputation) {
            return NextResponse.json(
                { error: "Reputation profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(reputation);
    } catch (error) {
        console.error("Error fetching my reputation:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
