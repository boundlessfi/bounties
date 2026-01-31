import { useContributorReputation } from "@/hooks/use-reputation";
import { ReputationTooltip } from "@/components/reputation/reputation-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface ParticipantCardProps {
    userId: string;
    label?: string;
}

export function ParticipantCard({ userId, label }: ParticipantCardProps) {
    const { data: reputation, isLoading } = useContributorReputation(userId);

    if (isLoading) {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        );
    }

    if (!reputation) {
        return (
            <div className="flex items-center gap-3 opacity-70">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                    <div className="font-medium">Unknown User</div>
                    <div className="text-xs text-muted-foreground">ID: {userId}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {label && <div className="text-xs font-medium text-muted-foreground">{label}</div>}
            <ReputationTooltip reputation={reputation}>
                <Link href={`/profile/${userId}`} className="flex items-center gap-3 group">
                    <Avatar className="h-10 w-10 border border-border group-hover:border-primary transition-colors">
                        <AvatarImage src={reputation.avatarUrl || undefined} />
                        <AvatarFallback>{reputation.displayName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                        <div className="font-bold group-hover:text-primary transition-colors">
                            {reputation.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {reputation.tier}
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            {reputation.totalScore} pts
                        </div>
                    </div>
                </Link>
            </ReputationTooltip>
        </div>
    );
}
