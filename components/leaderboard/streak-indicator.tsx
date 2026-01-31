import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakIndicatorProps {
    streak: number;
    className?: string;
}

export function StreakIndicator({ streak, className }: StreakIndicatorProps) {
    if (streak === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className={cn("flex items-center gap-1.5 text-muted-foreground font-medium text-sm", className)}
                        aria-label={`${streak} week streak`}
                    >
                        <Flame className="h-4 w-4" />
                        <span>{streak}</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{streak} week streak</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
