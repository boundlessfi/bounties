import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SubmissionDraft, SubmissionForm } from "@/types/submission-draft";

const DRAFT_KEY_PREFIX = "submission_draft_";
const AUTO_SAVE_DELAY = 1000;

function readDraftFromStorage(draftKey: string): SubmissionDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(draftKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as SubmissionDraft;
  } catch {
    window.localStorage.removeItem(draftKey);
    return null;
  }
}

export function useSubmissionDraft(bountyId: string) {
  const queryClient = useQueryClient();
  const draftKey = `${DRAFT_KEY_PREFIX}${bountyId}`;
  const queryKey = [DRAFT_KEY_PREFIX, bountyId] as const;

  const { data: draft = null } = useQuery<SubmissionDraft | null>({
    queryKey,
    queryFn: () => readDraftFromStorage(draftKey),
    staleTime: Infinity, // Keep draft fresh in cache until explicitly cleared
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: SubmissionForm) => {
      const newDraft: SubmissionDraft = {
        id: `draft_${bountyId}_${Date.now()}`,
        bountyId,
        formData,
        updatedAt: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(draftKey, JSON.stringify(newDraft));
      }
      return newDraft;
    },
    onSuccess: (newDraft) => {
      queryClient.setQueryData(queryKey, newDraft);
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftKey);
      }
      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
    },
  });

  const saveDraft = useCallback(
    (formData: SubmissionForm) => {
      saveMutation.mutate(formData);
    },
    [saveMutation],
  );

  const clearDraft = useCallback(() => {
    clearMutation.mutate();
  }, [clearMutation]);

  const autoSave = useCallback(
    (formData: SubmissionForm) => {
      const timer = setTimeout(() => {
        saveDraft(formData);
      }, AUTO_SAVE_DELAY);
      return () => clearTimeout(timer);
    },
    [saveDraft],
  );

  return {
    draft,
    saveDraft,
    clearDraft,
    autoSave,
  };
}
