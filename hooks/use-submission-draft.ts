import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SubmissionDraft, SubmissionForm } from "@/types/submission-draft";

const DRAFT_KEY_PREFIX = "submission_draft_";
const AUTO_SAVE_DELAY = 1000;

export function useSubmissionDraft(bountyId: string) {
  const queryClient = useQueryClient();
  const draftKey = `${DRAFT_KEY_PREFIX}${bountyId}`;
  const queryKey = [DRAFT_KEY_PREFIX, bountyId];

  const { data: draft = null } = useQuery<SubmissionDraft | null>({
    queryKey,
    queryFn: () => {
      const stored = localStorage.getItem(draftKey);
      return stored ? JSON.parse(stored) : null;
    },
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
      localStorage.setItem(draftKey, JSON.stringify(newDraft));
      return newDraft;
    },
    onSuccess: (newDraft) => {
      queryClient.setQueryData(queryKey, newDraft);
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(draftKey);
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
