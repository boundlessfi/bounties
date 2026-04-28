import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as viem from "viem";

// Mock dependencies
vi.mock("@/lib/services/reputation", () => ({
    ReputationService: {
        linkWallet: vi.fn(),
    },
}));

vi.mock("@/lib/server-auth", () => ({
    getCurrentUser: vi.fn(),
}));

vi.mock("viem", () => ({
    recoverMessageAddress: vi.fn(),
}));

const { ReputationService } = await import("@/lib/services/reputation");
const { getCurrentUser } = await import("@/lib/server-auth");

describe("POST /api/reputation/link-wallet", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 when missing parameters", async () => {
        const { POST } = await import("./route");
        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({ userId: "user-1" }),
        });
        const response = await POST(request);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe("Missing parameters");
    });

    it("should return 403 when user is unauthorized", async () => {
        const { POST } = await import("./route");
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "different-user" });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xabc",
                address: "0x1234567890123456789012345678901234567890",
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(403);
    });

    it("should return 400 when no nonce found", async () => {
        const { POST } = await import("./route");
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xabc",
                address: "0x1234567890123456789012345678901234567890",
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain("No nonce found");
    });

    it("should return 403 when signature recovery fails", async () => {
        const { POST, GET } = await import("./route");

        // First get a nonce
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const nonceRequest = new NextRequest(
            "http://localhost/api/reputation/link-wallet?userId=user-1&address=0x1234567890123456789012345678901234567890",
            { method: "GET" }
        );
        const nonceResponse = await GET(nonceRequest);
        const nonceData = await nonceResponse.json();
        const nonce = nonceData.nonce;

        // Now try to link with invalid signature
        vi.mocked(viem.recoverMessageAddress).mockRejectedValue(new Error("Invalid signature"));

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xinvalid",
                address: "0x1234567890123456789012345678901234567890",
                nonce,
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toContain("Invalid signature");
    });

    it("should return 403 when recovered address does not match", async () => {
        const { POST, GET } = await import("./route");

        // First get a nonce
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const nonceRequest = new NextRequest(
            "http://localhost/api/reputation/link-wallet?userId=user-1&address=0x1234567890123456789012345678901234567890",
            { method: "GET" }
        );
        const nonceResponse = await GET(nonceRequest);
        const nonceData = await nonceResponse.json();
        const nonce = nonceData.nonce;

        // Recover returns different address
        vi.mocked(viem.recoverMessageAddress).mockResolvedValue(
            "0xABCDEFABCDEFABCDEFABCDEFABCDEFABCDEFABCD" as `0x${string}`
        );

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xabc",
                address: "0x1234567890123456789012345678901234567890",
                nonce,
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toContain("does not match");
    });

    it("should return 403 when invalid nonce provided", async () => {
        const { POST, GET } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";

        // First get a nonce to seed the store
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const nonceRequest = new NextRequest(
            `http://localhost/api/reputation/link-wallet?userId=user-1&address=${walletAddress}`,
            { method: "GET" }
        );
        await GET(nonceRequest);

        // Now try with wrong nonce
        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xabc",
                address: walletAddress,
                nonce: "wrong-nonce",
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toContain("Invalid nonce");
    });

    it("should successfully link wallet with valid signature and nonce", async () => {
        const { POST, GET } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";

        // First get a nonce
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const nonceRequest = new NextRequest(
            `http://localhost/api/reputation/link-wallet?userId=user-1&address=${walletAddress}`,
            { method: "GET" }
        );
        const nonceResponse = await GET(nonceRequest);
        const nonceData = await nonceResponse.json();
        const nonce = nonceData.nonce;

        // Now link with valid signature
        vi.mocked(viem.recoverMessageAddress).mockResolvedValue(walletAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({ success: true });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: walletAddress,
                nonce,
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Wallet linked successfully");

        // Verify recoverMessageAddress was called with correct parameters
        expect(viem.recoverMessageAddress).toHaveBeenCalledWith({
            message: `Link wallet ${walletAddress} to user user-1\nNonce: ${nonce}`,
            signature: "0xvalidsignature",
        });
    });

    it("should consume nonce after use (prevent replay)", async () => {
        const { POST, GET } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";

        // First get a nonce
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const nonceRequest = new NextRequest(
            `http://localhost/api/reputation/link-wallet?userId=user-1&address=${walletAddress}`,
            { method: "GET" }
        );
        const nonceResponse = await GET(nonceRequest);
        const nonceData = await nonceResponse.json();
        const nonce = nonceData.nonce;

        // First use - success
        vi.mocked(viem.recoverMessageAddress).mockResolvedValue(walletAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({ success: true });

        const request1 = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: walletAddress,
                nonce,
            }),
        });
        const response1 = await POST(request1);
        expect(response1.status).toBe(200);

        // Second use with same nonce - should fail (nonce consumed)
        vi.mocked(viem.recoverMessageAddress).mockResolvedValue(walletAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({ success: true });

        const request2 = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: walletAddress,
                nonce,
            }),
        });
        const response2 = await POST(request2);
        expect(response2.status).toBe(400);
        const data2 = await response2.json();
        expect(data2.error).toContain("No nonce found");
    });

    it("should return 409 when wallet already linked", async () => {
        const { POST, GET } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";

        // Get nonce
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const nonceRequest = new NextRequest(
            `http://localhost/api/reputation/link-wallet?userId=user-1&address=${walletAddress}`,
            { method: "GET" }
        );
        const nonceResponse = await GET(nonceRequest);
        const nonceData = await nonceResponse.json();
        const nonce = nonceData.nonce;

        // Link fails - wallet already linked
        vi.mocked(viem.recoverMessageAddress).mockResolvedValue(walletAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({
            success: false,
            error: "Wallet already linked to another user",
        });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: walletAddress,
                nonce,
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(409);
    });

    it("should handle case-insensitive address comparison", async () => {
        const { POST, GET } = await import("./route");
        const mixedCaseAddress = "0x123456789012345678901234567890123456789A";

        // Get nonce
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const nonceRequest = new NextRequest(
            `http://localhost/api/reputation/link-wallet?userId=user-1&address=${mixedCaseAddress}`,
            { method: "GET" }
        );
        const nonceResponse = await GET(nonceRequest);
        const nonceData = await nonceResponse.json();
        const nonce = nonceData.nonce;
        const messageToSign = nonceData.message;

        // Recover returns mixed case, request uses lowercase
        vi.mocked(viem.recoverMessageAddress).mockResolvedValue(mixedCaseAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({ success: true });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: mixedCaseAddress.toLowerCase(),
                nonce,
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(200);

        // Verify POST used the exact message issued by GET
        expect(viem.recoverMessageAddress).toHaveBeenCalledWith({
            message: messageToSign,
            signature: "0xvalidsignature",
        });
    });

    it("should return nonce with correct message format via GET", async () => {
        const { GET } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";

        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        const request = new NextRequest(
            `http://localhost/api/reputation/link-wallet?userId=user-1&address=${walletAddress}`,
            { method: "GET" }
        );
        const response = await GET(request);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.nonce).toBeDefined();
        expect(data.message).toContain(walletAddress);
        expect(data.message).toContain("user-1");
        expect(data.message).toContain("Nonce:");
        expect(data.expiresAt).toBeDefined();
    });

    it("should return 400 from GET when missing parameters", async () => {
        const { GET } = await import("./route");
        const request = new NextRequest(
            "http://localhost/api/reputation/link-wallet?userId=user-1",
            { method: "GET" }
        );
        const response = await GET(request);
        expect(response.status).toBe(400);
    });
});
