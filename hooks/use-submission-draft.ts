import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SubmissionDraft, SubmissionForm } from "@/types/submission-draft";
import { submissionKeys } from "@/lib/query/query-keys";

const AUTO_SAVE_DELAY = 1000;

export function useSubmissionDraft(bountyId: string) {
  const queryClient = useQueryClient();
  const queryKey = submissionKeys.draft(bountyId);

  const { data: draft } = useQuery<SubmissionDraft | null>({
    queryKey,
    // Initialize from localStorage if available, otherwise null
    queryFn: () => {
      if (typeof window === "undefined") return null;
      const item = window.localStorage.getItem(`submission_draft_${bountyId}`);
      return item ? JSON.parse(item) : null;
    },
    staleTime: Infinity, // Keep drafts as long as needed
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
        window.localStorage.setItem(`submission_draft_${bountyId}`, JSON.stringify(newDraft));
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
        window.localStorage.removeItem(`submission_draft_${bountyId}`);
      }
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
    isSaving: saveMutation.isPending,
  };
}
