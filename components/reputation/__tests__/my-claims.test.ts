import { CLAIM_SECTIONS, getClaimsBySection, normalizeStatus, type MyClaim } from "@/components/reputation/my-claims";
import { describe, expect, it } from "@jest/globals";

describe("My Claims helpers", () => {
    it("normalizes status values consistently", () => {
        expect(normalizeStatus(" In Review ")).toBe("in-review");
        expect(normalizeStatus("UNDER_REVIEW")).toBe("under-review");
        expect(normalizeStatus("in_review")).toBe("in-review");
    });

    it("groups claims into Active Claims, In Review, and Completed by status", () => {
        const claims: MyClaim[] = [
            { bountyId: "1", title: "Active A", status: "active" },
            { bountyId: "2", title: "Active B", status: "claimed" },
            { bountyId: "3", title: "Review A", status: "in review" },
            { bountyId: "4", title: "Review B", status: "UNDER_REVIEW" },
            { bountyId: "5", title: "Completed A", status: "completed" },
            { bountyId: "6", title: "Completed B", status: "closed" },
            { bountyId: "7", title: "Unknown", status: "queued" },
        ];

        const groups = getClaimsBySection(claims);

        expect(groups).toHaveLength(CLAIM_SECTIONS.length);

        const activeGroup = groups.find((group) => group.section.title === "Active Claims");
        const reviewGroup = groups.find((group) => group.section.title === "In Review");
        const completedGroup = groups.find((group) => group.section.title === "Completed");

        expect(activeGroup?.claims.map((claim) => claim.bountyId)).toEqual(["1", "2"]);
        expect(reviewGroup?.claims.map((claim) => claim.bountyId)).toEqual(["3", "4"]);
        expect(completedGroup?.claims.map((claim) => claim.bountyId)).toEqual(["5", "6"]);

        const groupedIds = new Set(groups.flatMap((group) => group.claims.map((claim) => claim.bountyId)));
        expect(groupedIds.has("7")).toBe(false);
    });
});
