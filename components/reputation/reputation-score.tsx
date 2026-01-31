import { cn } from "@/lib/utils";

interface ReputationScoreProps {
    score: number;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function ReputationScore({ score, size = "md", className }: ReputationScoreProps) {
    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-xl",
        xl: "text-3xl"
    };

    return (
        <div className={cn("font-mono font-bold tracking-tight", sizeClasses[size], className)}>
            {score.toLocaleString()}
            <span className="text-muted-foreground text-[0.8em] ml-1 font-normal">pts</span>
        </div>
    );
}
