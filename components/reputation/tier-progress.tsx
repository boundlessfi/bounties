import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TierProgressProps {
    progress: number; // 0-100
    className?: string;
    showLabel?: boolean;
}

export function TierProgress({ progress, className, showLabel = true }: TierProgressProps) {
    return (
        <div className={cn("w-full space-y-1.5", className)}>
            {showLabel && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress to next tier</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            )}
            <Progress value={progress} className="h-2" />
        </div>
    );
}
