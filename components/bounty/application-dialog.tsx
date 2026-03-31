"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/ui/form-field-wrapper";

const applicationFormSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(10, "Cover letter must be at least 10 characters"),
  portfolioUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 || z.string().url().safeParse(value).success,
      "Please enter a valid URL",
    ),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface ApplicationDialogProps {
  bountyTitle: string;
  onApply: (data: {
    coverLetter: string;
    portfolioUrl?: string;
  }) => Promise<boolean>;
  trigger: ReactNode;
}

export function ApplicationDialog({
  bountyTitle,
  onApply,
  trigger,
}: ApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      coverLetter: "",
      portfolioUrl: "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  };

  const handleSubmit = async (values: ApplicationFormValues) => {
    form.clearErrors("root");
    setLoading(true);

    try {
      const portfolioUrl = values.portfolioUrl.trim();
      const success = await onApply({
        coverLetter: values.coverLetter,
        portfolioUrl: portfolioUrl.length > 0 ? portfolioUrl : undefined,
      });

      if (success) {
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      form.setError("root", {
        message: `Failed to submit application: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-131.25 bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle>Apply for Bounty</DialogTitle>
          <DialogDescription>
            Submit your application for &quot;{bountyTitle}&quot;.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid gap-4 py-4">
              <FormFieldWrapper
                control={form.control}
                name="coverLetter"
                label="Cover Letter"
                description="Explain why you are a good fit for this bounty."
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Explain why you are a good fit..."
                    className="min-h-37.5"
                  />
                )}
              />

              <FormFieldWrapper
                control={form.control}
                name="portfolioUrl"
                label="Portfolio URL (Optional)"
                description="Include a project, profile, or repository link."
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="https://..."
                    value={field.value ?? ""}
                  />
                )}
              />
            </div>

            <DialogFooter>
              {form.formState.errors.root?.message ? (
                <p className="text-destructive mr-auto text-sm">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
