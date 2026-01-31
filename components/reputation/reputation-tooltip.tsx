import { ContributorReputation } from "@/types/reputation";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TierBadge } from "./tier-badge";
import { ReputationScore } from "./reputation-score";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReputationTooltipProps {
    reputation: ContributorReputation;
    children: React.ReactNode;
    className?: string;
}

export function ReputationTooltip({ reputation, children, className }: ReputationTooltipProps) {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className={cn("inline-flex", className)}>
                    {children}
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 overflow-hidden border-border/50">
                <div className="p-4 bg-secondary/10 border-b border-border/50 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-background">
                        <AvatarImage src={reputation.avatarUrl || undefined} />
                        <AvatarFallback>{reputation.displayName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{reputation.displayName}</div>
                        <TierBadge tier={reputation.tier} className="scale-90 origin-left mt-0.5" />
                    </div>
                    <ReputationScore score={reputation.totalScore} size="md" />
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground text-xs">Completed</div>
                        <div className="font-mono font-bold">{reputation.stats.totalCompleted}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-xs">Rate</div>
                        <div className="font-mono font-bold">{reputation.stats.completionRate}%</div>
                    </div>
                </div>
                <div className="p-2 border-t border-border/50 bg-secondary/5 text-center">
                    <Link
                        href={`/profile/${reputation.userId}`}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        View Full Profile
                    </Link>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
