"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

export function BountyCardSkeleton() {
  return (
    <Card className="overflow-hidden w-full max-w-xs rounded-4xl border border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3 px-4 sm:px-5">
        {/* Header Row with Status and Reward */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2.5 h-2.5 rounded-full bg-gray-800" />
            <Skeleton className="h-5 w-14 rounded-full bg-gray-800" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-5 w-16 bg-gray-800" />
            <Skeleton className="h-3 w-10 ml-auto bg-gray-800" />
          </div>
        </div>
        {/* Title and Description */}
        <Skeleton className="h-5 w-full mb-1 bg-gray-800" />
        <Skeleton className="h-4 w-3/4 bg-gray-800" />
        {/* Type and Difficulty Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Skeleton className="h-6 w-16 rounded-full bg-gray-800" />
          <Skeleton className="h-6 w-20 rounded-full bg-gray-800" />
        </div>
      </CardHeader>
      <CardFooter className="border-t border-[#f0f0f0] dark:border-slate-700 py-3 px-4">
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full bg-gray-800" />
            <Skeleton className="h-4 w-20 bg-gray-800" />
          </div>
          <Skeleton className="h-4 w-16 bg-gray-800" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function BountyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BountyCardSkeleton key={i} />
      ))}
    </div>
  );
}
