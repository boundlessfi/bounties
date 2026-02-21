import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/helpers/format.helper";

export type MyClaim = {
    bountyId: string;
    title: string;
    status: string;
    nextMilestone?: string;
    rewardAmount?: number;
};

interface MyClaimsProps {
    claims: MyClaim[];
}

export const CLAIM_SECTIONS: { title: string; statuses: string[] }[] = [
    { title: "Active Claims", statuses: ["active", "claimed", "in-progress"] },
    { title: "In Review", statuses: ["in-review", "in review", "review", "pending", "under-review"] },
    { title: "Completed", statuses: ["completed", "closed", "accepted", "done"] },
];

export function normalizeStatus(status: string) {
    return status.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function formatStatusLabel(status: string) {
    return status
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getClaimsBySection(claims: MyClaim[]) {
    return CLAIM_SECTIONS.map((section) => ({
        section,
        claims: claims.filter((claim) => {
            const normalizedClaimStatus = normalizeStatus(claim.status);
            return section.statuses.some((status) => normalizeStatus(status) === normalizedClaimStatus);
        }),
    }));
}

export function MyClaims({ claims }: MyClaimsProps) {
    return (
        <div className="space-y-6">
            {getClaimsBySection(claims).map(({ section, claims: sectionClaims }) => {

                return (
                    <Card key={section.title} className="gap-4 py-5">
                        <CardHeader className="px-5">
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <CardDescription>
                                {sectionClaims.length === 0
                                    ? "No claims in this section."
                                    : `${sectionClaims.length} claim${sectionClaims.length === 1 ? "" : "s"}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-5">
                            {sectionClaims.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No opportunities yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {sectionClaims.map((claim) => (
                                        <div
                                            key={`${section.title}-${claim.bountyId}`}
                                            className="rounded-lg border border-border/60 bg-secondary/5 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 space-y-2">
                                                    <h4 className="truncate text-sm font-semibold" title={claim.title}>
                                                        {claim.title}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="outline">{formatStatusLabel(claim.status)}</Badge>
                                                        {typeof claim.rewardAmount === "number" && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatCurrency(claim.rewardAmount, "$")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {claim.nextMilestone && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Next milestone: {claim.nextMilestone}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button asChild variant="outline" size="sm" className="shrink-0">
                                                    <Link href={`/bounty/${claim.bountyId}`}>View Opportunity</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
