"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Ban, Shield } from "lucide-react";
import { ComplianceHoldState } from "@/types/compliance";

interface HoldMessageProps {
    holdState: ComplianceHoldState;
    reason?: string;
}

export function HoldMessage({ holdState, reason }: HoldMessageProps) {
    if (holdState === 'NONE') return null;

    const config = {
        REVIEW: {
            icon: Shield,
            variant: 'default' as const,
            title: 'Account Under Review',
            description: 'Your account is currently under review. Withdrawals are temporarily paused.',
        },
        SUSPENDED: {
            icon: AlertCircle,
            variant: 'destructive' as const,
            title: 'Account Suspended',
            description: 'Your account has been suspended. Please contact support for more information.',
        },
        BLOCKED: {
            icon: Ban,
            variant: 'destructive' as const,
            title: 'Account Blocked',
            description: 'Withdrawals are blocked on your account. Please contact support immediately.',
        },
    };

    const { icon: Icon, variant, title, description } = config[holdState];

    return (
        <Alert variant={variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {description}
                {reason && <div className="mt-2 text-sm">Reason: {reason}</div>}
            </AlertDescription>
        </Alert>
    );
}
