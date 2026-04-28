import { NextRequest, NextResponse } from "next/server";
import { ReputationService } from "@/lib/services/reputation";
import { getCurrentUser } from "@/lib/server-auth";
import { recoverMessageAddress } from "viem";

// In-memory nonce store (use Redis in production)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

// Generate a nonce for signature challenges
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const address = searchParams.get("address");

        if (!userId || !address) {
            return NextResponse.json(
                { error: "Missing userId or address" },
                { status: 400 }
            );
        }

        // Auth check
        const authenticatedUser = await getCurrentUser();
        if (!authenticatedUser || authenticatedUser.id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Generate nonce
        const nonce = crypto.randomUUID();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        const key = `${userId}:${address.toLowerCase()}`;
        nonceStore.set(key, { nonce, expiresAt });

        // Clean up expired entries periodically
        if (nonceStore.size > 1000) {
            const now = Date.now();
            for (const [k, v] of nonceStore.entries()) {
                if (v.expiresAt < now) nonceStore.delete(k);
            }
        }

        return NextResponse.json({
            nonce,
            message: `Link wallet ${address} to user ${userId}\nNonce: ${nonce}`,
            expiresAt,
        });
    } catch (error) {
        console.error("Error generating nonce:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, signature, address, nonce } = await request.json();

        if (!userId || !signature || !address) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // 1. Auth Check
        const authenticatedUser = await getCurrentUser();
        if (!authenticatedUser || authenticatedUser.id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 2. Nonce Validation
        const key = `${userId}:${address.toLowerCase()}`;
        const stored = nonceStore.get(key);

        if (!stored) {
            return NextResponse.json(
                { error: "No nonce found. Request a nonce first via GET /api/reputation/link-wallet" },
                { status: 400 }
            );
        }

        if (stored.expiresAt < Date.now()) {
            nonceStore.delete(key);
            return NextResponse.json(
                { error: "Nonce expired. Request a new nonce." },
                { status: 400 }
            );
        }

        if (!nonce || nonce !== stored.nonce) {
            return NextResponse.json(
                { error: "Invalid nonce" },
                { status: 403 }
            );
        }

        // 3. Signature Verification using recoverMessageAddress
        const signedMessage = `Link wallet ${address} to user ${userId}\nNonce: ${nonce}`;

        let recoveredAddress: `0x${string}`;
        try {
            recoveredAddress = await recoverMessageAddress({
                message: signedMessage,
                signature: signature as `0x${string}`,
            });
        } catch (verifyError) {
            console.error("Signature recovery failed:", verifyError);
            return NextResponse.json(
                { error: "Invalid signature format or recovery failed" },
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

        // Consume the nonce (one-time use)
        nonceStore.delete(key);

        // 4. Service Call
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
            verifiedAddress: recoveredAddress,
        });
    } catch (error) {
        console.error("Error linking wallet:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
