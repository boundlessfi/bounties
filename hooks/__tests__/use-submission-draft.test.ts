import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSubmissionDraft } from "../use-submission-draft";

describe("useSubmissionDraft", () => {
  const bountyId = "test-bounty-123";
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with no draft", () => {
    const { result } = renderHook(() => useSubmissionDraft(bountyId), {
      wrapper: createWrapper(),
    });
    expect(result.current.draft).toBeNull();
  });

  it("should save draft", async () => {
    const { result } = renderHook(() => useSubmissionDraft(bountyId), {
      wrapper: createWrapper(),
    });
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Test comment",
    };

    act(() => {
      result.current.saveDraft(formData);
    });

    await waitFor(() => expect(result.current.draft).not.toBeNull());
    expect(result.current.draft?.formData).toEqual(formData);
    expect(result.current.draft?.bountyId).toBe(bountyId);
  });

  it("should clear draft", async () => {
    const { result } = renderHook(() => useSubmissionDraft(bountyId), {
      wrapper: createWrapper(),
    });
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Test comment",
    };

    act(() => {
      result.current.saveDraft(formData);
    });

    await waitFor(() => expect(result.current.draft).not.toBeNull());

    act(() => {
      result.current.clearDraft();
    });

    await waitFor(() => expect(result.current.draft).toBeNull());
  });

  it("should auto-save after delay", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSubmissionDraft(bountyId), {
      wrapper: createWrapper(),
    });
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Auto-saved comment",
    };

    act(() => {
      result.current.autoSave(formData);
    });

    act(() => {
      jest.advanceTimersByTime(1000); // AUTO_SAVE_DELAY
    });

    await waitFor(() => expect(result.current.draft?.formData).toEqual(formData));
    expect(result.current.draft?.formData).toEqual(formData);
    jest.useRealTimers();
  });

  it("should persist draft across hook instances", async () => {
    const { result: result1 } = renderHook(() => useSubmissionDraft(bountyId), {
      wrapper: createWrapper(),
    });
    const formData = {
      githubPullRequestUrl: "https://github.com/test/pr/1",
      comments: "Persisted comment",
    };

    act(() => {
      result1.current.saveDraft(formData);
    });

    await waitFor(() => expect(result1.current.draft?.formData).toEqual(formData));

    const { result: result2 } = renderHook(() => useSubmissionDraft(bountyId), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result2.current.draft?.formData).toEqual(formData));
    expect(result2.current.draft?.formData).toEqual(formData);
  });

  it("should swallow corrupted localStorage data", async () => {
    localStorage.setItem(`submission_draft_${bountyId}`, "{bad json");

    const { result } = renderHook(() => useSubmissionDraft(bountyId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.draft).toBeNull());
    expect(localStorage.getItem(`submission_draft_${bountyId}`)).toBeNull();
  });
});
