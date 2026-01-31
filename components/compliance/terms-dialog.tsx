"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { TermsVersion } from "@/types/terms";
import { useAcceptTerms } from "@/hooks/use-compliance";

interface TermsDialogProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onAccepted: () => void;
}

export function TermsDialog({ open, onOpenChange, onAccepted }: TermsDialogProps) {
    const [agreed, setAgreed] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { data: terms } = useQuery({
        queryKey: ['terms'],
        queryFn: () => get<TermsVersion>('/api/compliance/terms'),
    });

    const acceptMutation = useAcceptTerms();

    const handleAccept = async () => {
        if (!terms || !agreed) return;

        try {
            await acceptMutation.mutateAsync(terms.id);
            onAccepted();
        } catch (error) {
            console.error('Failed to accept terms:', error);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        if (bottom) setScrolled(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{terms?.title || 'Terms and Conditions'}</DialogTitle>
                    <DialogDescription>
                        Please review and accept the terms to continue with withdrawals.
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="flex-1 overflow-y-auto border rounded p-4 text-sm"
                    onScroll={handleScroll}
                >
                    {terms?.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                    ))}
                </div>

                <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                        id="agree"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked as boolean)}
                        disabled={!scrolled}
                    />
                    <label htmlFor="agree" className="text-sm">
                        I have read and agree to the terms and conditions
                    </label>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleAccept}
                        disabled={!agreed || acceptMutation.isPending}
                    >
                        {acceptMutation.isPending ? 'Accepting...' : 'Accept & Continue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
