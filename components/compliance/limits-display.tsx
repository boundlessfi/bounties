"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { KYCTier } from "@/types/compliance";
import { useComplianceStatus } from "@/hooks/use-compliance";

interface LimitsDisplayProps {
    onUpgradeClick?: () => void;
}

const tierColors: Record<KYCTier, string> = {
    UNVERIFIED: 'bg-gray-500',
    BASIC: 'bg-blue-500',
    VERIFIED: 'bg-green-500',
    ENHANCED: 'bg-purple-500',
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function LimitsDisplay({ onUpgradeClick }: LimitsDisplayProps) {
    const { data, isLoading } = useComplianceStatus();

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Loading limits...</div>;
    }

    if (!data) return null;

    const { compliance, remaining, nextTier } = data;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Verification Tier:</span>
                    <Badge className={tierColors[compliance.currentTier]}>
                        {compliance.currentTier}
                    </Badge>
                </div>
                {nextTier && onUpgradeClick && (
                    <Button size="sm" variant="outline" onClick={onUpgradeClick} className="w-full">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Upgrade to {nextTier}
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                <LimitBar
                    label="Daily Limit"
                    used={compliance.usage.dailyUsed}
                    total={compliance.limits.daily}
                    remaining={remaining.daily}
                    percent={remaining.percentUsed.daily}
                />
                <LimitBar
                    label="Weekly Limit"
                    used={compliance.usage.weeklyUsed}
                    total={compliance.limits.weekly}
                    remaining={remaining.weekly}
                    percent={remaining.percentUsed.weekly}
                />
                <LimitBar
                    label="Monthly Limit"
                    used={compliance.usage.monthlyUsed}
                    total={compliance.limits.monthly}
                    remaining={remaining.monthly}
                    percent={remaining.percentUsed.monthly}
                />
            </div>
        </div>
    );
}

function LimitBar({ label, used, total, remaining, percent }: {
    label: string;
    used: number;
    total: number;
    remaining: number;
    percent: number;
}) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">
                    {formatCurrency(remaining)} / {formatCurrency(total)}
                </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
                <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, percent)}%` }}
                />
            </div>
        </div>
    );
}
