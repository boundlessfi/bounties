import { Skeleton } from "@/components/ui/skeleton";

export function BountyDetailSkeleton() {
  return (
    <div className="min-h-screen text-foreground pb-20 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-125 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="container mx-auto px-4 py-10 relative z-10">
        <Skeleton className="h-4 w-36 mb-8 bg-gray-800" />
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <div className="p-6 rounded-xl border border-gray-800 bg-background-card space-y-5">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-gray-800" />
                <Skeleton className="h-6 w-24 rounded-full bg-gray-800" />
                <Skeleton className="h-6 w-20 rounded-full bg-gray-800" />
              </div>
              <Skeleton className="h-8 w-3/4 bg-gray-800" />
              <Skeleton className="h-11 w-56 rounded-lg bg-gray-800" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-5 w-14 rounded-md bg-gray-800"
                  />
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl border border-gray-800 bg-background-card space-y-3">
              <Skeleton className="h-3 w-20 bg-gray-800 mb-5" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  className={`h-4 bg-gray-800 ${i % 3 === 0 ? "w-2/3" : "w-full"}`}
                />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-72 shrink-0">
            <div className="p-5 rounded-xl border border-gray-800 bg-background-card space-y-5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12 bg-gray-800" />
                <Skeleton className="h-8 w-20 bg-gray-800" />
              </div>
              <Skeleton className="h-px bg-gray-800" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-14 bg-gray-800" />
                  <Skeleton className="h-4 w-20 bg-gray-800" />
                </div>
              ))}
              <Skeleton className="h-px bg-gray-800" />
              <Skeleton className="h-11 w-full rounded-lg bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
