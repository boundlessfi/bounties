import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";

export async function POST(request: NextRequest) {
    try {
        const { userId, signature, address } = await request.json();

        if (!userId || !signature || !address) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // IMPORTANT: Verify signature logic should be here
        // e.g. verifyMessage(message, signature) === address

        // Call service to update
        // await ReputationService.linkWallet(userId, address);

        return NextResponse.json({ success: true, message: "Wallet linked simulated" });
    } catch (error) {
        console.error("Error linking wallet:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
