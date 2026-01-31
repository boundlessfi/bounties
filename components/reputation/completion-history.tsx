import { BountyCompletionRecord } from "@/types/reputation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface CompletionHistoryProps {
    records: BountyCompletionRecord[];
    className?: string;
    description?: string;
}

export function CompletionHistory({ records, className, description }: CompletionHistoryProps) {
    if (records.length === 0) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                No bounties completed yet.
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {description && (
                <div className="text-sm text-muted-foreground px-1">
                    {description}
                </div>
            )}
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="p-3 rounded-lg border border-border/50 bg-secondary/5 hover:bg-secondary/10 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium text-sm line-clamp-1" title={record.bountyTitle}>
                                        {record.bountyTitle}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                        <span className="font-medium text-foreground/80">{record.projectName}</span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(record.completedAt), { addSuffix: true })}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-sm text-primary">
                                        +{record.pointsEarned} pts
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {record.rewardAmount} {record.rewardCurrency}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-[10px] h-5 py-0 border-border/50">
                                        {record.difficulty}
                                    </Badge>
                                </div>

                                {record.maintainerRating && (
                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-600 dark:text-yellow-500 text-xs font-medium">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span>{record.maintainerRating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
