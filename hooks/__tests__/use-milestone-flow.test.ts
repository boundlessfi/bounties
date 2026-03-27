import { act, renderHook } from "@testing-library/react";
import { useMilestoneFlow } from "../use-milestone-flow";

describe("useMilestoneFlow", () => {
  const bountyId = "bounty-m4-test";
  const contributorId = "user-1";
  const reviewerId = "reviewer-1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("joins the flow and creates an active participant in milestone 1", () => {
    const { result } = renderHook(() => useMilestoneFlow(bountyId));

    act(() => {
      result.current.joinFlow(contributorId, "Alice");
    });

    const participant = result.current.getParticipant(contributorId);
    expect(participant).toBeDefined();
    expect(participant?.status).toBe("ACTIVE");
    expect(participant?.currentMilestoneIndex).toBe(0);
    expect(result.current.stageOccupancy[0]).toBe(1);
  });

  it("submits and advances to next milestone after approval", () => {
    const { result } = renderHook(() => useMilestoneFlow(bountyId));

    act(() => {
      result.current.joinFlow(contributorId, "Alice");
    });

    act(() => {
      result.current.submitMilestone(
        contributorId,
        "https://github.com/org/repo/pull/1",
        "Milestone 1 delivery",
      );
    });

    const submission = result.current.pendingSubmissions[0];
    expect(submission).toBeDefined();

    act(() => {
      result.current.reviewSubmission(submission.id, reviewerId, "APPROVED");
    });

    const participant = result.current.getParticipant(contributorId);
    expect(participant?.status).toBe("ACTIVE");
    expect(participant?.currentMilestoneIndex).toBe(1);
  });

  it("marks participant as completed on final milestone approval", () => {
    const { result } = renderHook(() => useMilestoneFlow(bountyId));

    act(() => {
      result.current.joinFlow(contributorId, "Alice");
    });

    for (let index = 0; index < 3; index += 1) {
      act(() => {
        result.current.submitMilestone(
          contributorId,
          `https://github.com/org/repo/pull/${index + 1}`,
        );
      });

      const pending = result.current.pendingSubmissions[0];

      act(() => {
        result.current.reviewSubmission(pending.id, reviewerId, "APPROVED");
      });
    }

    const participant = result.current.getParticipant(contributorId);
    expect(participant?.status).toBe("COMPLETED");
  });

  it("marks participant as rejected when a submission is rejected", () => {
    const { result } = renderHook(() => useMilestoneFlow(bountyId));

    act(() => {
      result.current.joinFlow(contributorId, "Alice");
    });

    act(() => {
      result.current.submitMilestone(
        contributorId,
        "https://github.com/org/repo/pull/1",
      );
    });

    const submission = result.current.pendingSubmissions[0];

    act(() => {
      result.current.reviewSubmission(submission.id, reviewerId, "REJECTED");
    });

    const participant = result.current.getParticipant(contributorId);
    expect(participant?.status).toBe("REJECTED");
  });
});
