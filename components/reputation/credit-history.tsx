import { SparkCreditEvent } from "@/types/spark-credits";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";

interface CreditHistoryProps {
  events: SparkCreditEvent[];
  className?: string;
}

export function CreditHistory({ events, className }: CreditHistoryProps) {
  if (events.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-8 text-muted-foreground text-sm",
          className,
        )}
      >
        No credit activity yet.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {events.map((event) => {
            const isEarned = event.type === "EARNED";
            return (
              <div
                key={event.id}
                className="p-3 rounded-lg border border-border/50 bg-secondary/5 hover:bg-secondary/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "mt-0.5 flex-shrink-0 rounded-full p-1",
                        isEarned
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                      )}
                    >
                      {isEarned ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {event.bountyTitle ?? event.description}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-4 py-0 border-border/50",
                            isEarned
                              ? "text-green-600 dark:text-green-400 border-green-500/30"
                              : "text-orange-600 dark:text-orange-400 border-orange-500/30",
                          )}
                        >
                          {isEarned ? "Earned" : "Spent"}
                        </Badge>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(event.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={cn(
                        "flex items-center gap-0.5 font-mono font-bold text-sm justify-end",
                        isEarned
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400",
                      )}
                    >
                      <span>{isEarned ? "+" : "-"}</span>
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span>{event.amount}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground mt-0.5 justify-end">
                      <Zap className="h-3 w-3" />
                      <span>{event.balance} balance</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
