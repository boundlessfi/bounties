"use client";

import * as React from "react";
import type {
  Control,
  ControllerProps,
  FieldValues,
  Path,
  UseControllerProps,
} from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ControllerRenderFn<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> = NonNullable<ControllerProps<TFieldValues, TName>["render"]>;

export type FormFieldWrapperProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> = Omit<UseControllerProps<TFieldValues, TName>, "name" | "control"> & {
  name: TName;
  control: Control<TFieldValues>;
  label: React.ReactNode;
  description?: React.ReactNode;
  render?: ControllerRenderFn<TFieldValues, TName>;
  children?: React.ReactNode | ControllerRenderFn<TFieldValues, TName>;
  className?: string;
};

export function FormFieldWrapper<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  render,
  children,
  className,
  ...controllerProps
}: FormFieldWrapperProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      control={control}
      {...controllerProps}
      render={(controllerRenderProps) => {
        const renderedInput = render
          ? render(controllerRenderProps)
          : typeof children === "function"
            ? (children as ControllerRenderFn<TFieldValues, TName>)(
                controllerRenderProps,
              )
            : children;

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>{renderedInput}</FormControl>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
