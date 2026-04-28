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
    verifyMessage: vi.fn(),
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

    it("should return 403 when signature verification fails", async () => {
        const { POST } = await import("./route");
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        vi.mocked(viem.verifyMessage).mockRejectedValue(new Error("Invalid signature"));

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xinvalid",
                address: "0x1234567890123456789012345678901234567890",
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toContain("Invalid signature");
    });

    it("should return 403 when recovered address does not match", async () => {
        const { POST } = await import("./route");
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        vi.mocked(viem.verifyMessage).mockResolvedValue("0xdifferentaddress00000000000000000000");

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
        const data = await response.json();
        expect(data.error).toContain("does not match");
    });

    it("should successfully link wallet with valid signature", async () => {
        const { POST } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        vi.mocked(viem.verifyMessage).mockResolvedValue(walletAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({ success: true });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: walletAddress,
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Wallet linked successfully");

        // Verify verifyMessage was called with correct parameters
        expect(viem.verifyMessage).toHaveBeenCalledWith({
            message: `Link wallet ${walletAddress} to user user-1`,
            signature: "0xvalidsignature",
            address: walletAddress,
        });
    });

    it("should use custom message when provided", async () => {
        const { POST } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";
        const customMessage = "Custom signing message";
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        vi.mocked(viem.verifyMessage).mockResolvedValue(walletAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({ success: true });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: walletAddress,
                message: customMessage,
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(200);

        expect(viem.verifyMessage).toHaveBeenCalledWith({
            message: customMessage,
            signature: "0xvalidsignature",
            address: walletAddress,
        });
    });

    it("should return 409 when wallet already linked", async () => {
        const { POST } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        vi.mocked(viem.verifyMessage).mockResolvedValue(walletAddress as `0x${string}`);
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
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(409);
    });

    it("should handle case-insensitive address comparison", async () => {
        const { POST } = await import("./route");
        const walletAddress = "0x1234567890123456789012345678901234567890";
        const mixedCaseAddress = "0x123456789012345678901234567890123456789A";
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" });
        vi.mocked(viem.verifyMessage).mockResolvedValue(mixedCaseAddress as `0x${string}`);
        vi.mocked(ReputationService.linkWallet).mockResolvedValue({ success: true });

        const request = new NextRequest("http://localhost/api/reputation/link-wallet", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-1",
                signature: "0xvalidsignature",
                address: mixedCaseAddress.toLowerCase(),
            }),
        });
        const response = await POST(request);
        expect(response.status).toBe(200);
    });
});
