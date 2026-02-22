"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Save, Send, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  submissionFormSchema,
  type SubmissionFormValue,
} from "@/components/bounty/forms/schemas";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { bountiesApi } from "@/lib/api/bounties";
import { authClient } from "@/lib/auth-client";
import { mockWalletInfo } from "@/lib/mock-wallet";

interface SubmissionDialogProps {
  bountyId: string;
  bountyTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getBaseDefaults = (): SubmissionFormValue => ({
  githubUrl: "",
  demoUrl: "",
  explanation: "",
  attachments: [],
  walletAddress: mockWalletInfo.address,
});

export function SubmissionDialog({
  bountyId,
  bountyTitle,
  open,
  onOpenChange,
}: SubmissionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: session } = authClient.useSession();
  const storageKey = `submission-draft-${bountyId}`;
  const [draft, setDraft] = useLocalStorage<SubmissionFormValue | null>(
    storageKey,
    null,
  );

  const baseDefaults = getBaseDefaults();

  const form = useForm<SubmissionFormValue>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: draft
      ? { ...draft, walletAddress: baseDefaults.walletAddress }
      : baseDefaults,
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachments" as never,
  });

  useEffect(() => {
    if (open && draft) {
      form.reset({ ...draft, walletAddress: baseDefaults.walletAddress });
    } else if (open) {
      form.reset(baseDefaults);
    }
    if (open) {
      setSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const saveDraft = useCallback(() => {
    const values = form.getValues();
    setDraft(values);
    toast.success("Draft saved");
    onOpenChange(false);
  }, [form, setDraft, onOpenChange]);

  const clearDraft = useCallback(() => {
    setDraft(null);
  }, [setDraft]);

  const onSubmit = async (data: SubmissionFormValue) => {
    const contributorId = session?.user?.id;
    if (!contributorId) {
      toast.error("You must be signed in to submit.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        githubUrl: data.githubUrl || undefined,
        demoUrl: data.demoUrl || undefined,
        attachments: data.attachments?.filter(Boolean),
        contributorId,
      };

      await bountiesApi.submit(bountyId, payload);

      clearDraft();
      form.reset(baseDefaults);
      setSubmitted(true);
      toast.success("Submission sent successfully!");

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        onOpenChange(false);
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg bg-background border-border">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Send className="size-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Submission Sent!
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your work for &quot;{bountyTitle}&quot; has been submitted and is
              pending review.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Work</DialogTitle>
          <DialogDescription>
            Submit your work for &quot;{bountyTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Wallet Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="G... or 0x..."
                      readOnly
                      className="bg-muted cursor-default"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your connected wallet (rewards will be sent here)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Explanation <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your implementation, approach, and any relevant details..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length ?? 0}/5,000 characters (min 20)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to your pull request or repository
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="demoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to a live demo or recording
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments - dynamic list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">
                  Attachments
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => append("" as never)}
                >
                  <Plus className="size-3" />
                  Add URL
                </Button>
              </div>
              {fields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No attachments added. Click &quot;Add URL&quot; to include
                  supporting links.
                </p>
              )}
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`attachments.${index}`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="https://..." {...inputField} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 size-9 text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {draft && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Save className="size-3" />
                Draft restored from previous session
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={submitting || !session?.user?.id}
                className="gap-1.5"
              >
                <Save className="size-4" />
                Save Draft
              </Button>
              <Button
                type="submit"
                disabled={submitting || !session?.user?.id}
                className="gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
