import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakBadgeProps {
    streak: number;
    className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
    if (streak === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("flex items-center gap-1 text-orange-500 font-bold font-mono text-sm", className)}>
                        <Flame className="w-4 h-4 fill-orange-500" />
                        <span className="text-foreground">{streak}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-muted-foreground">{streak} bounty completion streak!</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
