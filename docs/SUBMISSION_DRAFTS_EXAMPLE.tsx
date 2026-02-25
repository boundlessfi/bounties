/**
 * Submission Draft System - Quick Start Example
 * 
 * This example shows how to integrate the submission draft system
 * into any form component.
 */

import { useState, useEffect } from "react";
import { useSubmissionDraft } from "@/hooks/use-submission-draft";

export function SubmissionFormExample({ bountyId }: { bountyId: string }) {
  const { draft, clearDraft, autoSave } = useSubmissionDraft(bountyId);
  
  const [prUrl, setPrUrl] = useState("");
  const [comments, setComments] = useState("");

  // 1. Load draft when component mounts
  useEffect(() => {
    if (draft?.formData) {
      setPrUrl(draft.formData.githubPullRequestUrl);
      setComments(draft.formData.comments);
    }
  }, [draft]);

  // 2. Auto-save when form changes
  useEffect(() => {
    const cleanup = autoSave({ 
      githubPullRequestUrl: prUrl, 
      comments 
    });
    return cleanup;
  }, [prUrl, comments, autoSave]);

  // 3. Clear draft on successful submit
  const handleSubmit = async () => {
    // Your submit logic here
    await submitToAPI({ prUrl, comments });
    
    // Clear draft after success
    clearDraft();
    
    // Reset form
    setPrUrl("");
    setComments("");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Show draft indicator */}
      {draft && (
        <div className="text-xs text-blue-400">
          Draft saved at {new Date(draft.updatedAt).toLocaleString()}
        </div>
      )}
      
      <input
        value={prUrl}
        onChange={(e) => setPrUrl(e.target.value)}
        placeholder="Pull Request URL"
      />
      
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Comments"
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}

// Mock submit function
async function submitToAPI(data: { prUrl: string; comments: string }) {
  console.log("Submitting:", data);
}
