import { z } from "zod";

// Schema para BudgetInput
export const budgetSchema = z.object({
  amount: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Amount is required"
          : "Amount must be a number",
    })
    .positive("Amount must be greater than 0")
    .max(1_000_000_000, "Amount exceeds maximum"),
  asset: z.enum(["XLM", "USDC", "AQUA"], {
    error: "Please select an asset",
  }),
});

export type BudgetValue = z.infer<typeof budgetSchema>;

// Schema para DeadlineInput
export const deadlineSchema = z
  .date({
    error: (issue) =>
      issue.input === undefined ? "Please select a deadline" : "Invalid date",
  })
  .refine((date) => date > new Date(), "Deadline must be in the future");

export type DeadlineValue = z.infer<typeof deadlineSchema>;

// Schema para Milestone individual
export const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  percentage: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Percentage is required"
          : "Percentage must be a number",
    })
    .min(1, "Percentage must be at least 1%")
    .max(100, "Percentage cannot exceed 100%"),
});

export type MilestoneValue = z.infer<typeof milestoneSchema>;

// Schema para array de Milestones
export const milestonesSchema = z
  .array(milestoneSchema)
  .min(1, "At least one milestone is required")
  .refine(
    (milestones) => {
      const total = milestones.reduce((sum, m) => sum + m.percentage, 0);
      return total === 100;
    },
    { message: "Milestone percentages must total 100%" },
  );

export type MilestonesValue = z.infer<typeof milestonesSchema>;

// Schema para descripción markdown
export const markdownContentSchema = z
  .string()
  .min(10, "Content must be at least 10 characters")
  .max(10000, "Content must not exceed 10,000 characters");

export type MarkdownContentValue = z.infer<typeof markdownContentSchema>;

export const submissionFormSchema = z.object({
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  explanation: z
    .string()
    .min(20, "Explanation must be at least 20 characters")
    .max(5000, "Explanation must not exceed 5,000 characters"),
  attachments: z.array(z.string().url("Must be a valid URL")).optional(),
  walletAddress: z.string().min(1, "Wallet address is required"),
});

export type SubmissionFormValue = z.infer<typeof submissionFormSchema>;
