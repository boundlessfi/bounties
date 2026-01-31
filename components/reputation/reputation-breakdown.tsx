import { ReputationBreakdown as BreakdownType } from "@/types/reputation";
import { cn } from "@/lib/utils";

interface ReputationBreakdownProps {
    breakdown: BreakdownType;
    className?: string;
}

export function ReputationBreakdown({ breakdown, className }: ReputationBreakdownProps) {
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    const categories = [
        { key: 'features', label: 'Features', color: 'bg-emerald-500' },
        { key: 'bugs', label: 'Bugs', color: 'bg-red-500' },
        { key: 'documentation', label: 'Docs', color: 'bg-blue-500' },
        { key: 'refactoring', label: 'Refactor', color: 'bg-yellow-500' },
        { key: 'other', label: 'Other', color: 'bg-gray-500' },
    ] as const;

    return (
        <div className={cn("flex w-full h-2 rounded-full overflow-hidden", className)}>
            {categories.map((cat) => {
                const value = breakdown[cat.key];
                if (value === 0) return null;
                const percent = (value / total) * 100;

                return (
                    <div
                        key={cat.key}
                        className={cat.color}
                        style={{ width: `${percent}%` }}
                        title={`${cat.label}: ${value} pts (${Math.round(percent)}%)`}
                    />
                );
            })}
        </div>
    );
}
