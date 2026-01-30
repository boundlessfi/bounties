import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await context.params;
        const reputation = await ReputationService.getReputationByWallet(address);

        if (!reputation) {
            return NextResponse.json(
                { error: "Reputation profile not found for wallet" },
                { status: 404 }
            );
        }

        return NextResponse.json(reputation);
    } catch (error) {
        console.error("Error fetching reputation by wallet:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
