import { ReputationTier } from "@/types/leaderboard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: ReputationTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
    return (
        <Badge
            variant="secondary"
            className={cn("font-medium bg-secondary/20 text-foreground hover:bg-secondary/70 border-0", className)}
        >
            {tier}
        </Badge>
    );
}
