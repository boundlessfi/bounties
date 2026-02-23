import { describe, it, expect } from "vitest";
import { BountyStore } from "./store";
import {
  Application,
  Submission,
  MilestoneParticipation,
} from "@/types/participation";

describe("BountyStore", () => {
  // Note: Since BountyStore uses a global singleton, state might persist.
  // Ideally we'd have a reset method, but for this basic verification we'll assume clean state or manage it.
  // However, unit tests in Vitest usually run in isolation per file, but global state might persist if not reset.
  // For now, let's just test distinct IDs.

  describe("Model 2: Applications", () => {
    it("should add and retrieve an application", () => {
      const app: Application = {
        id: "app-1",
        bountyId: "b-1",
        applicantId: "u-1",
        coverLetter: "Hire me",
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      BountyStore.addApplication(app);
      const retrieved = BountyStore.getApplicationById("app-1");
      expect(retrieved).toEqual(app);
      const list = BountyStore.getApplicationsByBounty("b-1");
      expect(list).toHaveLength(1);
    });

    it("should update application status", () => {
      const updated = BountyStore.updateApplication("app-1", {
        status: "approved",
      });
      expect(updated?.status).toBe("approved");
      expect(BountyStore.getApplicationById("app-1")?.status).toBe("approved");
    });
  });

  describe("Model 3: Submissions", () => {
    it("should add and retrieve a submission", () => {
      const sub: Submission = {
        id: "sub-1",
        bountyId: "b-2",
        contributorId: "u-2",
        content: "My work",
        explanation: "My work",
        walletAddress: "GABC1234567890EXAMPLEWALLETADDRESS",
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      BountyStore.addSubmission(sub);
      expect(BountyStore.getSubmissionById("sub-1")).toEqual(sub);
    });

    it("should update submission status", () => {
      BountyStore.updateSubmission("sub-1", { status: "accepted" });
      expect(BountyStore.getSubmissionById("sub-1")?.status).toBe("accepted");
    });
  });

  describe("Model 4: Milestones", () => {
    it("should join a milestone", () => {
      const mp: MilestoneParticipation = {
        id: "mp-1",
        bountyId: "b-3",
        contributorId: "u-3",
        currentMilestone: 1,
        status: "active",
        joinedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      BountyStore.addMilestoneParticipation(mp);
      const list = BountyStore.getMilestoneParticipationsByBounty("b-3");
      expect(list).toHaveLength(1);
    });

    it("should advance a milestone", () => {
      BountyStore.updateMilestoneParticipation("mp-1", { currentMilestone: 2 });
      const mp = BountyStore.getMilestoneParticipationsByBounty("b-3").find(
        (p: MilestoneParticipation) => p.id === "mp-1",
      );
      expect(mp?.currentMilestone).toBe(2);
    });
  });
});
