import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";
import { RateContributorInput } from "@/types/reputation";

export async function POST(request: NextRequest) {
    try {
        // Auth Check: Ensure user is a maintainer (Mock for now)
        // const user = await getCurrentUser();
        // if (!user || !user.isMaintainer) return 403...

        const body: RateContributorInput = await request.json();
        const { contributorId, rating, bountyId } = body;

        // Validation
        if (!contributorId || !rating || !bountyId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Call service (mock maintainer ID)
        const success = await ReputationService.rateContributor("maintainer-1", contributorId, rating);

        return NextResponse.json({ success });
    } catch (error) {
        console.error("Error rating contributor:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
