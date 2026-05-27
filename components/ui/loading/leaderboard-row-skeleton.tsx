"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function LeaderboardRowSkeleton() {
  return (
    <TableRow className="border-b border-border/60">
      <TableCell className="text-center font-medium">
        <div className="flex justify-center">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1 md:hidden">
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        {/* Desktop tags */}
        <div className="hidden md:flex gap-1 mt-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-4 w-12 ml-auto" />
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell">
        <Skeleton className="h-4 w-8 ml-auto" />
      </TableCell>
      <TableCell className="text-right hidden lg:table-cell">
        <Skeleton className="h-4 w-16 ml-auto" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end">
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function LeaderboardTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border border-border/50 overflow-hidden bg-background-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="w-[80px] text-center font-bold text-foreground">
              RANK
            </TableHead>
            <TableHead className="font-bold text-foreground">
              CONTRIBUTOR
            </TableHead>
            <TableHead className="hidden md:table-cell font-bold text-foreground">
              TIER
            </TableHead>
            <TableHead className="text-right font-bold text-foreground">
              SCORE
            </TableHead>
            <TableHead className="text-right hidden sm:table-cell font-bold text-foreground">
              COMPLETED
            </TableHead>
            <TableHead className="text-right hidden lg:table-cell font-bold text-foreground">
              EARNINGS
            </TableHead>
            <TableHead className="text-right font-bold text-foreground">
              STREAK
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <LeaderboardRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
