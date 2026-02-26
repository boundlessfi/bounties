import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { SubmissionDraft, SubmissionForm } from "@/types/submission-draft";

const DRAFT_KEY_PREFIX = "submission_draft_";
const AUTO_SAVE_DELAY = 1000;

export function useSubmissionDraft(bountyId: string) {
  const draftKey = `${DRAFT_KEY_PREFIX}${bountyId}`;
  const [draft, setDraft] = useLocalStorage<SubmissionDraft | null>(draftKey, null);

  const saveDraft = useCallback(
    (formData: SubmissionForm) => {
      const newDraft: SubmissionDraft = {
        id: `draft_${bountyId}_${Date.now()}`,
        bountyId,
        formData,
        updatedAt: new Date().toISOString(),
      };
      setDraft(newDraft);
    },
    [bountyId, setDraft]
  );

  const clearDraft = useCallback(() => {
    setDraft(null);
  }, [setDraft]);

  const autoSave = useCallback(
    (formData: SubmissionForm) => {
      const timer = setTimeout(() => {
        if (formData.githubPullRequestUrl || formData.comments) {
          saveDraft(formData);
        }
      }, AUTO_SAVE_DELAY);
      return () => clearTimeout(timer);
    },
    [saveDraft]
  );

  return {
    draft,
    saveDraft,
    clearDraft,
    autoSave,
  };
}
