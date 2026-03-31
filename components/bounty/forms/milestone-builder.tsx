"use client";

import * as React from "react";
import {
  useFieldArray,
  type ArrayPath,
  type Path,
  type UseFormReturn,
  type FieldValues,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FormFieldWrapper } from "@/components/ui/form-field-wrapper";

type MilestoneDraft = {
  title: string;
  description?: string;
  percentage: number;
};

interface MilestoneBuilderProps<
  TFieldValues extends FieldValues,
  TName extends ArrayPath<TFieldValues>,
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  maxMilestones?: number;
}

export function MilestoneBuilder<
  TFieldValues extends FieldValues,
  TName extends ArrayPath<TFieldValues>,
>({
  form,
  name,
  maxMilestones = 10,
}: MilestoneBuilderProps<TFieldValues, TName>) {
  const { fields, append, remove } = useFieldArray<TFieldValues, TName>({
    control: form.control,
    name,
  });

  const milestones = form.watch(name as Path<TFieldValues>) as
    | ReadonlyArray<MilestoneDraft>
    | undefined;
  const totalPercentage =
    milestones?.reduce((sum, m) => sum + (m.percentage || 0), 0) ?? 0;
  const remainingPercentage = 100 - totalPercentage;

  const handleAddMilestone = () => {
    const defaultPercentage = Math.max(0, Math.min(remainingPercentage, 25));
    append({
      title: "",
      description: "",
      percentage: defaultPercentage,
    } as never);
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total allocation</span>
          <span
            className={cn(
              "font-medium",
              totalPercentage === 100 && "text-green-500",
              totalPercentage > 100 && "text-destructive",
            )}
          >
            {totalPercentage}%
          </span>
        </div>
        <Progress
          value={Math.min(totalPercentage, 100)}
          className={cn(totalPercentage > 100 && "[&>div]:bg-destructive")}
        />
        {totalPercentage !== 100 && (
          <p
            className={cn(
              "text-xs",
              totalPercentage > 100
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {totalPercentage > 100
              ? `Exceeds by ${totalPercentage - 100}%`
              : `${remainingPercentage}% remaining`}
          </p>
        )}
      </div>

      {/* Milestone list */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border-input relative space-y-3 rounded-lg border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground text-sm font-medium">
                Milestone {index + 1}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
              <FormFieldWrapper
                control={form.control}
                name={`${name}.${index}.title` as Path<TFieldValues>}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g., Initial implementation"
                  />
                )}
                label="Title"
              />

              <FormFieldWrapper
                control={form.control}
                name={`${name}.${index}.percentage` as Path<TFieldValues>}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    min={1}
                    max={100}
                    placeholder="25"
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value);
                      field.onChange(Number.isNaN(parsed) ? undefined : parsed);
                    }}
                  />
                )}
                label="%"
              />
            </div>

            <FormFieldWrapper
              control={form.control}
              name={`${name}.${index}.description` as Path<TFieldValues>}
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Describe deliverables for this milestone..."
                  rows={2}
                />
              )}
              label="Description (optional)"
            />
          </div>
        ))}
      </div>

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddMilestone}
        disabled={fields.length >= maxMilestones}
        className="w-full"
      >
        <Plus className="mr-2 size-4" />
        Add Milestone
      </Button>
    </div>
  );
}
