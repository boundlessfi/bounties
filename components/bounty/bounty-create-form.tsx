"use client";

import { useMemo, useState } from "react";
import { BountyType } from "@/lib/graphql/generated";
import { useCreateBounty } from "@/hooks/use-create-bounty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

const CURRENCIES = ["XLM", "USDC", "EURC"] as const;
const TYPES = [
  { value: BountyType.FixedPrice, label: "Fixed Price" },
  { value: BountyType.Competition, label: "Competition" },
  { value: BountyType.MilestoneBased, label: "Milestone Based" },
];

type RewardCurrency = (typeof CURRENCIES)[number];

type Milestone = {
  id: string;
  title: string;
  percent: string;
};

type FormErrors = Record<string, string>;

function parseGithubIssueNumber(url: string) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/issues\/(\d+)/);
    return match ? Number(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

function isValidUrl(url: string) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function BountyCreateForm() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState<BountyType>(BountyType.FixedPrice);
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardCurrency, setRewardCurrency] = useState<RewardCurrency>("XLM");
  const [githubIssueUrl, setGithubIssueUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [bountyWindowId, setBountyWindowId] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", title: "Milestone 1", percent: "50" },
    { id: "2", title: "Milestone 2", percent: "50" },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createBountyAsync, isPending } = useCreateBounty();

  const isFixedPrice = type === BountyType.FixedPrice;
  const isCompetition = type === BountyType.Competition;
  const isMilestone = type === BountyType.MilestoneBased;

  const computeMilestoneTotal = useMemo(
    () =>
      milestones.reduce((sum, milestone) => {
        const value = Number(milestone.percent);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [milestones],
  );

  const buildDescription = () => {
    const parts = [description.trim()];

    if (category) {
      parts.push(`Category: ${category}`);
    }

    if (organizationId) {
      parts.push(`Organization: ${organizationId}`);
    }

    if (deadline) {
      parts.push(`Deadline: ${deadline}`);
    }

    if (isCompetition && startDate && endDate) {
      parts.push(`Competition window: ${startDate} → ${endDate}`);
    }

    if (isMilestone) {
      parts.push(
        "Milestones:\n" +
          milestones
            .map(
              (milestone, index) =>
                `  ${index + 1}. ${milestone.title} — ${milestone.percent}%`,
            )
            .join("\n"),
      );
    }

    if (bountyWindowId) {
      parts.push(`Lightning round window: ${bountyWindowId}`);
    }

    return parts.filter(Boolean).join("\n\n");
  };

  const validateStepOne = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Title is required.";
    } else if (title.trim().length < 10) {
      nextErrors.title = "Title must be at least 10 characters.";
    }

    if (!description.trim() || description.trim().length < 20) {
      nextErrors.description = "Description must be at least 20 characters.";
    }

    if (!organizationId.trim()) {
      nextErrors.organizationId = "Organization ID is required.";
    }

    if (isFixedPrice && !githubIssueUrl.trim()) {
      nextErrors.githubIssueUrl = "GitHub issue URL is required for fixed-price bounties.";
    }

    if (githubIssueUrl.trim() && !isValidUrl(githubIssueUrl.trim())) {
      nextErrors.githubIssueUrl = "Enter a valid GitHub issue URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepTwo = () => {
    const nextErrors: FormErrors = {};
    const amount = Number(rewardAmount);

    if (!rewardAmount.trim() || amount <= 0 || Number.isNaN(amount)) {
      nextErrors.rewardAmount = "Reward amount must be greater than zero.";
    }

    if (!rewardCurrency) {
      nextErrors.rewardCurrency = "Select a reward currency.";
    }

    if (deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(deadline) < today) {
        nextErrors.deadline = "Deadline must be in the future.";
      }
    }

    if (isCompetition) {
      if (!startDate) {
        nextErrors.startDate = "Competition start date is required.";
      }
      if (!endDate) {
        nextErrors.endDate = "Competition end date is required.";
      }
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        if (start <= now) {
          nextErrors.startDate = "Start date must be in the future.";
        }
        if (start >= end) {
          nextErrors.endDate = "End date must be after the start date.";
        }
      }
    }

    if (isMilestone) {
      const invalidMilestone = milestones.some(
        (milestone) =>
          !milestone.title.trim() ||
          Number.isNaN(Number(milestone.percent)) ||
          Number(milestone.percent) <= 0,
      );
      if (milestones.length < 2 || invalidMilestone) {
        nextErrors.milestones =
          "Milestone-based bounties require at least 2 milestones with a valid payout.";
      }
      if (computeMilestoneTotal !== 100) {
        nextErrors.milestones =
          "Milestone payout percentages must add up to 100%.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStepOne() || !validateStepTwo()) return;
    const input = {
      title: title.trim(),
      description: buildDescription(),
      githubIssueUrl: githubIssueUrl.trim() || undefined,
      githubIssueNumber: parseGithubIssueNumber(githubIssueUrl.trim()),
      organizationId: organizationId.trim(),
      projectId: projectId.trim() || undefined,
      rewardAmount: Number(rewardAmount),
      rewardCurrency,
      type,
      bountyWindowId: bountyWindowId.trim() || undefined,
    };

    try {
      setSubmitError(null);
      await createBountyAsync(input);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the bounty.",
      );
    }
  };

  const stepOne = (
    <Card className="p-6">
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <FieldContent>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Short, clear bounty title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="type">Bounty type</FieldLabel>
            <FieldContent>
              <Select value={type} onValueChange={(value) => setType(value as BountyType)}>
                <SelectTrigger className="w-full border-gray-700 hover:border-gray-600 focus:border-primary/50 h-9">
                  <SelectValue placeholder="Select bounty type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="description">Cover description</FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explain what you need, acceptance criteria, and any context."
              rows={6}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </FieldContent>
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="organizationId">Organization ID</FieldLabel>
            <FieldContent>
              <Input
                id="organizationId"
                value={organizationId}
                onChange={(event) => setOrganizationId(event.target.value)}
                placeholder="org-boundless or your org ID"
              />
              {errors.organizationId && (
                <p className="text-sm text-destructive">{errors.organizationId}</p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="projectId">Project / Category ID</FieldLabel>
            <FieldContent>
              <Input
                id="projectId"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                placeholder="Optional project or category identifier"
              />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="githubIssueUrl">GitHub issue URL</FieldLabel>
          <FieldContent>
            <Input
              id="githubIssueUrl"
              value={githubIssueUrl}
              onChange={(event) => setGithubIssueUrl(event.target.value)}
              placeholder="https://github.com/owner/repo/issues/123"
            />
            {errors.githubIssueUrl && (
              <p className="text-sm text-destructive">{errors.githubIssueUrl}</p>
            )}
          </FieldContent>
        </Field>
      </div>
    </Card>
  );

  const stepTwo = (
    <Card className="p-6">
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="rewardAmount">Reward amount</FieldLabel>
            <FieldContent>
              <Input
                id="rewardAmount"
                type="number"
                min="0"
                step="0.01"
                value={rewardAmount}
                onChange={(event) => setRewardAmount(event.target.value)}
                placeholder="0.00"
              />
              {errors.rewardAmount && (
                <p className="text-sm text-destructive">{errors.rewardAmount}</p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="rewardCurrency">Currency</FieldLabel>
            <FieldContent>
              <Select
                value={rewardCurrency}
                onValueChange={(value) => setRewardCurrency(value as RewardCurrency)}
              >
                <SelectTrigger className="w-full border-gray-700 hover:border-gray-600 focus:border-primary/50 h-9">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rewardCurrency && (
                <p className="text-sm text-destructive">{errors.rewardCurrency}</p>
              )}
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
            <FieldContent>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
              {errors.deadline && (
                <p className="text-sm text-destructive">{errors.deadline}</p>
              )}
            </FieldContent>
          </Field>
        </div>

        {isCompetition && (
          <div className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="startDate">Competition start date</FieldLabel>
              <FieldContent>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate}</p>
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="endDate">Competition end date</FieldLabel>
              <FieldContent>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate}</p>
                )}
              </FieldContent>
            </Field>
          </div>
        )}

        {isMilestone && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <FieldTitle>Milestones</FieldTitle>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() =>
                  setMilestones((prev) => [
                    ...prev,
                    { id: Date.now().toString(), title: `Milestone ${prev.length + 1}`, percent: "0" },
                  ])
                }
              >
                Add milestone
              </Button>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="grid gap-4 md:grid-cols-[1.5fr_0.8fr_0.5fr]"
                >
                  <Input
                    value={milestone.title}
                    onChange={(event) => {
                      const value = event.target.value;
                      setMilestones((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, title: value } : item,
                        ),
                      );
                    }}
                    placeholder={`Milestone ${index + 1}`}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={milestone.percent}
                    onChange={(event) => {
                      const value = event.target.value;
                      setMilestones((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, percent: value } : item,
                        ),
                      );
                    }}
                    placeholder="Percent"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() =>
                      setMilestones((prev) => prev.filter((_, idx) => idx !== index))
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Total payout: {computeMilestoneTotal}%
            </p>
            {errors.milestones && (
              <p className="text-sm text-destructive">{errors.milestones}</p>
            )}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="bountyWindowId">Lightning round window ID</FieldLabel>
          <FieldContent>
            <Input
              id="bountyWindowId"
              value={bountyWindowId}
              onChange={(event) => setBountyWindowId(event.target.value)}
              placeholder="Optional bounty window ID"
            />
          </FieldContent>
        </Field>
      </div>
    </Card>
  );

  const stepThree = (
    <div className="space-y-6">
      <Card className="border-gray-800">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Review your bounty</h2>
            <p className="text-sm text-muted-foreground">
              Confirm the details below before submitting.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Title
              </p>
              <p className="mt-2 text-sm font-medium">{title || "—"}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Type
              </p>
              <p className="mt-2 text-sm font-medium">
                {TYPES.find((option) => option.value === type)?.label}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Reward
              </p>
              <p className="mt-2 text-sm font-medium">
                {rewardAmount} {rewardCurrency}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Organization
              </p>
              <p className="mt-2 text-sm font-medium">
                {organizationId || "—"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                GitHub issue URL
              </p>
              <p className="mt-2 text-sm leading-tight break-all">
                {githubIssueUrl || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Deadline
              </p>
              <p className="mt-2 text-sm">{deadline || "None"}</p>
            </div>
          </div>

          {isCompetition && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Competition window
              </p>
              <p className="mt-2 text-sm">{startDate || "—"} → {endDate || "—"}</p>
            </div>
          )}

          {isMilestone && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Milestones
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {milestones.map((milestone, index) => (
                  <li key={milestone.id}>
                    <span className="font-medium">{milestone.title}</span> — {milestone.percent}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold">Cover description</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {buildDescription() || "No description provided."}
        </p>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Sponsor bounty creation
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Create a new bounty
            </h1>
          </div>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </Card>
        </div>
      </div>

      <Card className="border-gray-800 p-8">
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {step === 1 && stepOne}
        {step === 2 && stepTwo}
        {step === 3 && stepThree}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  setErrors({});
                  setStep(step - 1);
                }}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {step < 3 && (
              <Button
                onClick={() => {
                  if (step === 1 && validateStepOne()) {
                    setErrors({});
                    setStep(2);
                  }
                  if (step === 2 && validateStepTwo()) {
                    setErrors({});
                    setStep(3);
                  }
                }}
              >
                Continue
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Creating…" : "Create bounty"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
