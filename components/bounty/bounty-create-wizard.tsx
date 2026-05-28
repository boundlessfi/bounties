"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCreateBounty } from "@/hooks/use-create-bounty";
import { BountyType } from "@/lib/graphql/generated";

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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy organizations for now
const ORGANIZATIONS = [
  { id: "org-1", name: "Stellar Privacy Lab" },
  { id: "org-2", name: "Boundless" },
];

const CURRENCIES = ["XLM", "USDC", "EURC"];

const BountyCreationSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    organizationId: z.string().min(1, "Organization is required"),
    githubIssueUrl: z.string().url("Must be a valid URL"),
    type: z.nativeEnum(BountyType),
    rewardAmount: z.coerce
      .number()
      .min(0.01, "Reward amount must be greater than 0"),
    rewardCurrency: z.string().min(1, "Currency is required"),
    deadline: z.string().min(1, "Deadline is required"), // E2E expects Deadline
    startDate: z.string().optional(),
    milestones: z
      .array(
        z.object({
          title: z.string().min(1, "Milestone title required"),
          percentage: z.coerce.number().min(1).max(100),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === BountyType.Competition) {
      if (!data.startDate) {
        ctx.addIssue({
          path: ["startDate"],
          message: "Start date is required",
          code: "custom",
        });
      }
    }
    if (data.type === BountyType.MilestoneBased) {
      if (!data.milestones || data.milestones.length < 2) {
        ctx.addIssue({
          path: ["milestones"],
          message: "At least 2 milestones are required",
          code: "custom",
        });
      } else {
        const sum = data.milestones.reduce(
          (acc, m) => acc + (m.percentage || 0),
          0,
        );
        if (sum !== 100) {
          ctx.addIssue({
            path: ["milestones"],
            message: `Milestone percentages must sum to 100% (currently ${sum}%)`,
            code: "custom",
          });
        }
      }
    }
  });

type FormData = z.infer<typeof BountyCreationSchema>;

export function BountyCreateWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { mutateAsync: createBounty, isPending } = useCreateBounty();

  const form = useForm({
    resolver: zodResolver(BountyCreationSchema),
    defaultValues: {
      title: "",
      description: "",
      organizationId: "",
      githubIssueUrl: "",
      type: BountyType.FixedPrice,
      rewardAmount: 0,
      rewardCurrency: "",
      deadline: "",
      startDate: "",
      milestones: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  const selectedType = form.watch("type");

  const validateStep1 = async () => {
    const valid = await form.trigger([
      "title",
      "description",
      "organizationId",
      "githubIssueUrl",
      "type",
    ]);
    if (valid) setStep(2);
  };

  const validateStep2 = async () => {
    const fieldsToValidate: (keyof FormData)[] = [
      "rewardAmount",
      "rewardCurrency",
      "deadline",
    ];
    if (selectedType === BountyType.Competition)
      fieldsToValidate.push("startDate");
    if (selectedType === BountyType.MilestoneBased)
      fieldsToValidate.push("milestones");

    const valid = await form.trigger(fieldsToValidate);
    if (valid) setStep(3);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await createBounty({
        input: {
          title: data.title,
          description: data.description,
          organizationId: data.organizationId,
          githubIssueUrl: data.githubIssueUrl,
          type: data.type,
          rewardAmount: data.rewardAmount,
          rewardCurrency: data.rewardCurrency,
          // Note: Omitting startDate, deadline, milestones from GQL as they are not natively supported in CreateBountyInput yet.
        },
      });

      if (response?.createBounty?.id) {
        router.push(`/bounty/${response.createBounty.id}`);
      }
    } catch {
      // Error is handled by hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Info */}
        <div
          className={cn(
            "space-y-6 transition-all duration-300",
            step === 1 ? "block opacity-100" : "hidden opacity-0",
          )}
        >
          <h3 className="text-xl font-semibold mb-4 text-primary">
            Step 1: Basic Information
          </h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Implement Zero-Knowledge proofs"
                    className="bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed description of the bounty..."
                    className="min-h-[120px] bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORGANIZATIONS.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type" // Map correctly to UI label but field is "type"
              render={() => (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bounty Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
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
                          <SelectItem value={BountyType.MultiWinnerMilestone}>
                            Multi-winner Milestone
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="githubIssueUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/..."
                    className="bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={validateStep1}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Step 2: Rewards and Timeline */}
        <div
          className={cn(
            "space-y-6 transition-all duration-300",
            step === 2 ? "block opacity-100" : "hidden opacity-0",
          )}
        >
          <h3 className="text-xl font-semibold mb-4 text-primary">
            Step 2: Rewards and Timeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="rewardAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0000001"
                      className="bg-background/50"
                      {...field}
                      value={field.value as number | string | undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rewardCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedType === BountyType.Competition && (
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-background/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {selectedType === BountyType.MilestoneBased && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium">Milestones</h4>
                  <p className="text-sm text-muted-foreground">
                    Define milestones and payout percentages (must sum to 100%)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: "", percentage: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Milestone
                </Button>
              </div>

              {form.formState.errors.milestones?.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.milestones.root.message}
                </p>
              )}

              {fields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`milestones.${index}.title`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder={`Milestone ${index + 1} Title`}
                            className="bg-background/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`milestones.${index}.percentage`}
                    render={({ field }) => (
                      <FormItem className="w-[120px]">
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              className="bg-background/50 pr-8"
                              {...field}
                              value={field.value as number | string | undefined}
                            />
                            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                              %
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={validateStep2}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Step 3: Review */}
        <div
          className={cn(
            "space-y-6 transition-all duration-300",
            step === 3 ? "block opacity-100" : "hidden opacity-0",
          )}
        >
          <h3 className="text-xl font-semibold mb-4 text-primary">
            Step 3: Review
          </h3>

          <Card className="bg-background/30 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">
                {form.getValues("title") || "Untitled Bounty"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block mb-1">Type</span>
                  <span className="font-medium">{form.getValues("type")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">
                    Reward
                  </span>
                  <span className="font-medium text-emerald-400">
                    {String(form.getValues("rewardAmount"))}{" "}
                    {String(form.getValues("rewardCurrency"))}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block mb-1">
                    Organization
                  </span>
                  <span className="font-medium">
                    {ORGANIZATIONS.find(
                      (o) => o.id === form.getValues("organizationId"),
                    )?.name || "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block mb-1">
                    Deadline
                  </span>
                  <span className="font-medium">
                    {form.getValues("deadline") || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Creating..." : "Create Bounty"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
