export interface SubmissionForm {
  githubPullRequestUrl: string;
  comments: string;
}

export interface SubmissionDraft {
  id: string;
  bountyId: string;
  formData: SubmissionForm;
  updatedAt: string;
}
