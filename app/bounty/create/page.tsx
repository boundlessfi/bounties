"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBounty } from "@/hooks/use-bounty-mutations";
import { BountyType, type CreateBountyInput } from "@/lib/graphql/generated";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormState = {
  title: string;
  description: string;
  organizationId: string;
  githubIssueUrl: string;
  type: BountyType;
  rewardAmount: string;
  rewardCurrency: string;
  deadline: string;
  milestoneTitle: string;
  competitionSeats: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  organizationId: "",
  githubIssueUrl: "",
  type: BountyType.FixedPrice,
  rewardAmount: "",
  rewardCurrency: "XLM",
  deadline: "",
  milestoneTitle: "",
  competitionSeats: "3",
};

export default function CreateBountyPage() {
  const router = useRouter();
  const createBounty = useCreateBounty();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const title = useMemo(() => {
    if (step === 1) return "Bounty details";
    if (step === 2) return "Reward setup";
    return "Review bounty";
  }, [step]);

  const updateField = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.description.trim())
      nextErrors.description = "Description is required";
    if (!form.organizationId.trim())
      nextErrors.organizationId = "Organization is required";
    if (!form.githubIssueUrl.trim())
      nextErrors.githubIssueUrl = "GitHub issue URL is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepTwo = () => {
    const nextErrors: Record<string, string> = {};
    const rewardAmount = Number(form.rewardAmount);
    if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) {
      nextErrors.rewardAmount = "Reward amount must be greater than 0";
    }
    if (!form.rewardCurrency.trim())
      nextErrors.rewardCurrency = "Currency is required";
    if (!form.deadline) nextErrors.deadline = "Deadline is required";
    if (
      form.type === BountyType.MilestoneBased &&
      !form.milestoneTitle.trim()
    ) {
      nextErrors.milestoneTitle = "Milestone title is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateStepOne()) return;
    if (step === 2 && !validateStepTwo()) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step < 3) {
      goNext();
      return;
    }

    const input: CreateBountyInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      organizationId: form.organizationId.trim(),
      githubIssueUrl: form.githubIssueUrl.trim(),
      type: form.type,
      rewardAmount: Number(form.rewardAmount),
      rewardCurrency: form.rewardCurrency,
    };

    const result = await createBounty.mutateAsync(input);
    router.push(`/bounty/${result.createBounty.id}`);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Create Bounty
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Add the sponsor-side information contributors need before this
              bounty goes live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {step === 1 && (
                <section className="space-y-5" data-testid="create-step-1">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(event) =>
                        updateField("title")(event.target.value)
                      }
                      aria-invalid={Boolean(errors.title)}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(event) =>
                        updateField("description")(event.target.value)
                      }
                      aria-invalid={Boolean(errors.description)}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={form.organizationId}
                        onChange={(event) =>
                          updateField("organizationId")(event.target.value)
                        }
                        aria-invalid={Boolean(errors.organizationId)}
                      />
                      {errors.organizationId && (
                        <p className="text-sm text-destructive">
                          {errors.organizationId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="githubIssueUrl">GitHub URL</Label>
                      <Input
                        id="githubIssueUrl"
                        type="url"
                        value={form.githubIssueUrl}
                        onChange={(event) =>
                          updateField("githubIssueUrl")(event.target.value)
                        }
                        aria-invalid={Boolean(errors.githubIssueUrl)}
                      />
                      {errors.githubIssueUrl && (
                        <p className="text-sm text-destructive">
                          {errors.githubIssueUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bounty type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(value) => updateField("type")(value)}
                    >
                      <SelectTrigger aria-label="Bounty type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BountyType.FixedPrice}>
                          Fixed Price
                        </SelectItem>
                        <SelectItem value={BountyType.Competition}>
                          Competition
                        </SelectItem>
                        <SelectItem value={BountyType.MilestoneBased}>
                          Milestone Based
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-5" data-testid="create-step-2">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rewardAmount">Reward amount</Label>
                      <Input
                        id="rewardAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.rewardAmount}
                        onChange={(event) =>
                          updateField("rewardAmount")(event.target.value)
                        }
                        aria-invalid={Boolean(errors.rewardAmount)}
                      />
                      {errors.rewardAmount && (
                        <p className="text-sm text-destructive">
                          {errors.rewardAmount}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={form.rewardCurrency}
                        onValueChange={(value) =>
                          updateField("rewardCurrency")(value)
                        }
                      >
                        <SelectTrigger aria-label="Currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XLM">XLM</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="AQUA">AQUA</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.rewardCurrency && (
                        <p className="text-sm text-destructive">
                          {errors.rewardCurrency}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(event) =>
                        updateField("deadline")(event.target.value)
                      }
                      aria-invalid={Boolean(errors.deadline)}
                    />
                    {errors.deadline && (
                      <p className="text-sm text-destructive">
                        {errors.deadline}
                      </p>
                    )}
                  </div>

                  {form.type === BountyType.MilestoneBased && (
                    <div className="space-y-2">
                      <Label htmlFor="milestoneTitle">Milestone title</Label>
                      <Input
                        id="milestoneTitle"
                        value={form.milestoneTitle}
                        onChange={(event) =>
                          updateField("milestoneTitle")(event.target.value)
                        }
                        aria-invalid={Boolean(errors.milestoneTitle)}
                      />
                      {errors.milestoneTitle && (
                        <p className="text-sm text-destructive">
                          {errors.milestoneTitle}
                        </p>
                      )}
                    </div>
                  )}

                  {form.type === BountyType.Competition && (
                    <div className="space-y-2">
                      <Label htmlFor="competitionSeats">Winner seats</Label>
                      <Input
                        id="competitionSeats"
                        type="number"
                        min="1"
                        value={form.competitionSeats}
                        onChange={(event) =>
                          updateField("competitionSeats")(event.target.value)
                        }
                      />
                    </div>
                  )}
                </section>
              )}

              {step === 3 && (
                <section className="space-y-4" data-testid="create-step-3">
                  <div className="rounded-md border p-4">
                    <h2 className="font-medium">{form.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {form.description}
                    </p>
                  </div>
                  <dl className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Organization</dt>
                      <dd>{form.organizationId}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">GitHub URL</dt>
                      <dd>{form.githubIssueUrl}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>{form.type}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Reward</dt>
                      <dd>
                        {form.rewardAmount} {form.rewardCurrency}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Deadline</dt>
                      <dd>{form.deadline}</dd>
                    </div>
                  </dl>
                </section>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((current) => Math.max(current - 1, 1))}
                  disabled={step === 1 || createBounty.isPending}
                >
                  Back
                </Button>
                <Button type="submit" disabled={createBounty.isPending}>
                  {step === 3
                    ? createBounty.isPending
                      ? "Creating..."
                      : "Create"
                    : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
