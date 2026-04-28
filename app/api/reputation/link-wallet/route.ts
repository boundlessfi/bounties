import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";
import { getCurrentUser } from "@/lib/server-auth";
import { verifyMessage } from "viem";

export async function POST(request: NextRequest) {
    try {
        const { userId, signature, address, message } = await request.json();

        if (!userId || !signature || !address) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // 1. Auth Check
        const authenticatedUser = await getCurrentUser();
        if (!authenticatedUser || authenticatedUser.id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 2. Signature Verification
        // Reconstruct the signed message (client should send the exact message that was signed)
        const signedMessage = message || `Link wallet ${address} to user ${userId}`;

        let recoveredAddress: `0x${string}`;
        try {
            recoveredAddress = await verifyMessage({
                message: signedMessage,
                signature: signature as `0x${string}`,
                address: address as `0x${string}`,
            });
        } catch (verifyError) {
            console.error("Signature verification failed:", verifyError);
            return NextResponse.json(
                { error: "Invalid signature format or verification failed" },
                { status: 403 }
            );
        }

        // Verify the recovered address matches the provided address
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return NextResponse.json(
                { error: "Signature does not match the provided wallet address" },
                { status: 403 }
            );
        }

        // 3. Service Call
        const result = await ReputationService.linkWallet(userId, address);

        if (!result.success) {
            if (result.error === "Wallet already linked to another user") {
                return NextResponse.json({ error: result.error }, { status: 409 });
            }
            return NextResponse.json({ error: result.error || "Failed to link wallet" }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Wallet linked successfully",
            verifiedAddress: recoveredAddress 
        });
    } catch (error) {
        console.error("Error linking wallet:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
