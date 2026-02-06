import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";
import { getCurrentUser } from "@/lib/server-auth";
import { verifyMessage } from "viem";

export async function POST(request: NextRequest) {
    try {
        const { userId, signature, address } = await request.json();

        if (!userId || !signature || !address) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // 1. Auth Check
        const authenticatedUser = await getCurrentUser();
        if (!authenticatedUser || authenticatedUser.id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 2. Signature Verification using viem
        const message = `Link wallet ${address} to user ${userId}`;
        
        try {
            const isValidSignature = await verifyMessage({
                address: address as `0x${string}`,
                message: message,
                signature: signature as `0x${string}`,
            });

            if (!isValidSignature) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
            }
        } catch (verifyError) {
            console.error("Signature verification failed:", verifyError);
            return NextResponse.json({ error: "Invalid signature format" }, { status: 403 });
        }

        // 3. Service Call
        const result = await ReputationService.linkWallet(userId, address);

        if (!result.success) {
            if (result.error === "Wallet already linked to another user") {
                return NextResponse.json({ error: result.error }, { status: 409 });
            }
            return NextResponse.json({ error: result.error || "Failed to link wallet" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Wallet linked successfully" });
    } catch (error) {
        console.error("Error linking wallet:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
