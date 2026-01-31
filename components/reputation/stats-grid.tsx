import { BountyStats } from "@/types/reputation";
import { cn } from "@/lib/utils";
import { CheckCircle2, Coins, Timer, Zap } from "lucide-react";

interface StatsGridProps {
    stats: BountyStats;
    className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
    return (
        <div className={cn("grid grid-cols-2 gap-4", className)}>
            <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Rate</span>
                </div>
                <div className="font-mono font-bold text-sm">
                    {stats.completionRate}%
                </div>
            </div>

            <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Earned</span>
                </div>
                <div className="font-mono font-bold text-sm">
                    {stats.totalEarnings.toLocaleString()} {stats.earningsCurrency}
                </div>
            </div>

            <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Avg Time</span>
                </div>
                <div className="font-mono font-bold text-sm">
                    {stats.averageCompletionTime}h
                </div>
            </div>

            <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                    <span>Streak</span>
                </div>
                <div className="font-mono font-bold text-sm">
                    {stats.currentStreak}
                </div>
            </div>
        </div>
    );
}
