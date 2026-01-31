import { ReputationTier } from "@/types/reputation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Star, Sparkles, Award } from "lucide-react";

interface TierBadgeProps {
    tier: ReputationTier;
    className?: string;
    showIcon?: boolean;
}

const TIER_CONFIG: Record<ReputationTier, { icon: React.ElementType, color: string }> = {
    NEWCOMER: { icon: Star, color: "text-muted-foreground" },
    CONTRIBUTOR: { icon: Award, color: "text-blue-500" },
    ESTABLISHED: { icon: Medal, color: "text-green-500" },
    EXPERT: { icon: Trophy, color: "text-purple-500" },
    LEGEND: { icon: Sparkles, color: "text-amber-500" },
};

export function TierBadge({ tier, className, showIcon = true }: TierBadgeProps) {
    const config = TIER_CONFIG[tier];
    const Icon = config.icon;

    return (
        <Badge
            variant="secondary"
            className={cn("font-medium bg-secondary/50 text-foreground border border-border/50", className)}
        >
            {showIcon && <Icon className={cn("w-3 h-3 mr-1.5", config.color)} />}
            {tier}
        </Badge>
    );
}
