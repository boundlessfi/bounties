import { ContributorReputation } from "@/types/reputation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "./tier-badge";
import { ReputationScore } from "./reputation-score";
import { TierProgress } from "./tier-progress";
import { StatsGrid } from "./stats-grid";
import { ReputationBreakdown } from "./reputation-breakdown";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReputationCardProps {
    reputation: ContributorReputation;
    className?: string;
}

export function ReputationCard({ reputation, className }: ReputationCardProps) {
    return (
        <Card className={cn("overflow-hidden border-border/50", className)}>
            <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src={reputation.avatarUrl || undefined} />
                            <AvatarFallback>{reputation.displayName?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <CardTitle className="text-lg font-bold">{reputation.displayName}</CardTitle>
                            <div className="flex flex-col items-center gap-2">
                                <TierBadge tier={reputation.tier} className="text-xs py-0 h-5" />
                                {reputation.lastActiveAt && (
                                    <span className="text-xs text-muted-foreground">
                                        active {formatDistanceToNow(new Date(reputation.lastActiveAt), { addSuffix: true })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <ReputationScore score={reputation.totalScore} size="lg" />
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                {/* Progress */}
                <div>
                    <TierProgress progress={reputation.tierProgress} />
                </div>

                {/* Breakdown */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Score Breakdown</span>
                    </div>
                    <ReputationBreakdown breakdown={reputation.breakdown} />
                </div>

                {/* Stats */}
                <StatsGrid stats={reputation.stats} />

                {/* Expertise */}
                {reputation.topTags.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Expertise</span>
                        <div className="flex flex-wrap gap-1.5">
                            {reputation.topTags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs font-normal">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
