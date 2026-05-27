import { Skeleton } from "@/components/ui/skeleton";

export function WalletPageSkeleton() {
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
