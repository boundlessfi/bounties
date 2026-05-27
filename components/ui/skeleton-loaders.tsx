import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export function BountyCardSkeleton() {
  return (
    <Card className="flex flex-col h-full bg-background-card border-gray-800">
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4 bg-gray-800" />
          <Skeleton className="h-6 w-16 rounded-full bg-gray-800" />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Skeleton className="h-5 w-20 rounded-full bg-gray-800" />
          <Skeleton className="h-5 w-24 rounded-full bg-gray-800" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-gray-800" />
          <Skeleton className="h-4 w-5/6 bg-gray-800" />
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-gray-800">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-gray-800" />
            <Skeleton className="h-4 w-16 bg-gray-800" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full bg-gray-800" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function BountyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BountyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border rounded-lg bg-background-card/50"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BountyDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-4">
          <div className="flex gap-4 border-b pb-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2 pt-4 border-t">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
