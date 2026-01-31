import { cn } from "@/lib/utils";

interface RankBadgeProps {
    rank: number;
    className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps) {
    if (rank <= 3) {
        return (
            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold", className)}>
                {rank}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-6 h-6 text-foreground font-semibold text-sm">
            {rank}
        </div>
    );
}
