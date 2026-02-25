import { renderHook, act, waitFor } from "@testing-library/react";
import { useSubmissionDraft } from "../use-submission-draft";

describe("useSubmissionDraft", () => {
  const bountyId = "test-bounty-123";

  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with no draft", () => {
    const { result } = renderHook(() => useSubmissionDraft(bountyId));
    expect(result.current.draft).toBeNull();
  });

  it("should save draft", () => {
    const { result } = renderHook(() => useSubmissionDraft(bountyId));
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Test comment",
    };

    act(() => {
      result.current.saveDraft(formData);
    });

    expect(result.current.draft).not.toBeNull();
    expect(result.current.draft?.formData).toEqual(formData);
    expect(result.current.draft?.bountyId).toBe(bountyId);
  });

  it("should clear draft", () => {
    const { result } = renderHook(() => useSubmissionDraft(bountyId));
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Test comment",
    };

    act(() => {
      result.current.saveDraft(formData);
    });

    expect(result.current.draft).not.toBeNull();

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.draft).toBeNull();
  });

  it("should auto-save after delay", async () => {
    const { result } = renderHook(() => useSubmissionDraft(bountyId));
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Auto-saved comment",
    };

    act(() => {
      result.current.autoSave(formData);
    });

    await waitFor(
      () => {
        expect(result.current.draft?.formData).toEqual(formData);
      },
      { timeout: 1500 }
    );
  });

  it("should persist draft across hook instances", () => {
    const { result: result1 } = renderHook(() => useSubmissionDraft(bountyId));
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Persisted comment",
    };

    act(() => {
      result1.current.saveDraft(formData);
    });

    const { result: result2 } = renderHook(() => useSubmissionDraft(bountyId));
    expect(result2.current.draft?.formData).toEqual(formData);
  });
});
