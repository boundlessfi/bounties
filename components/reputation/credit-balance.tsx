"use client";

import { useSparkCreditsBalance } from "@/hooks/use-spark-credits";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface CreditBalanceProps {
  userId: string;
  className?: string;
}

export function CreditBalance({ userId, className }: CreditBalanceProps) {
  const { data, isLoading, isError } = useSparkCreditsBalance(userId);

  if (isLoading) {
    return <Skeleton className="h-6 w-14 rounded-full" />;
  }

  if (isError) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border border-border/50 bg-secondary/10 text-muted-foreground",
          className,
        )}
      >
        <Zap className="h-3.5 w-3.5" />
        <span>—</span>
      </div>
    );
  }

  const balance = data?.balance ?? 0;
  const isLow = balance <= 1;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border",
              isLow
                ? "border-destructive/40 bg-destructive/5 text-destructive"
                : "border-border/50 bg-secondary/10 text-foreground",
              className,
            )}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>{balance}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-56 text-xs">
          <p className="font-semibold mb-1">Spark Credits</p>
          <p className="text-muted-foreground">
            Each FCFS bounty claim costs 1 Spark Credit. Earn credits by
            completing bounties.
          </p>
          {isLow && balance === 0 && (
            <p className="mt-1 text-destructive font-medium">
              No credits remaining — complete a bounty to earn more.
            </p>
          )}
          {isLow && balance === 1 && (
            <p className="mt-1 text-destructive font-medium">
              Only 1 credit left — consider completing a bounty soon.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
