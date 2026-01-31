"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { KYCTier, DocumentType } from "@/types/compliance";
import { ComplianceService } from "@/lib/services/compliance";
import { VerificationService } from "@/lib/services/verification";
import { useUpgradeTier } from "@/hooks/use-compliance";
import { DocumentUpload } from "./document-upload";

interface TierUpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentTier: KYCTier;
    targetTier: KYCTier;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

export function TierUpgradeDialog({ open, onOpenChange, currentTier, targetTier }: TierUpgradeDialogProps) {
    const [step, setStep] = useState<'info' | 'documents'>('info');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<Set<DocumentType>>(new Set());
    const upgradeMutation = useUpgradeTier();
    const tierConfig = ComplianceService.getTierConfig(targetTier);
    const requiredDocs = VerificationService.getRequiredDocuments(targetTier);

    const handleUpgrade = async () => {
        try {
            const request = await upgradeMutation.mutateAsync(targetTier);
            setRequestId(request.id);
            if (requiredDocs.length > 0) {
                setStep('documents');
            } else {
                onOpenChange(false);
            }
        } catch (error: any) {
            alert(error.message || 'Failed to request upgrade');
        }
    };

    const handleDocumentUpload = async (type: DocumentType, file: File) => {
        if (!requestId) return;

        await VerificationService.uploadDocument(requestId, {
            type,
            fileName: file.name,
            file,
        });

        setUploadedDocs(prev => new Set(prev).add(type));
    };

    const handleComplete = () => {
        setStep('info');
        setUploadedDocs(new Set());
        setRequestId(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upgrade to {targetTier} Tier</DialogTitle>
                    <DialogDescription>
                        {step === 'info'
                            ? 'Increase your withdrawal limits by upgrading your verification tier.'
                            : 'Upload required documents to complete your verification.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'info' ? (
                    <div className="space-y-4">
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                            <h4 className="font-semibold text-sm">New Limits</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Daily:</span>
                                    <span className="ml-2 font-medium">{formatCurrency(tierConfig.limits.daily)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Weekly:</span>
                                    <span className="ml-2 font-medium">{formatCurrency(tierConfig.limits.weekly)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Monthly:</span>
                                    <span className="ml-2 font-medium">{formatCurrency(tierConfig.limits.monthly)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Per Transaction:</span>
                                    <span className="ml-2 font-medium">{formatCurrency(tierConfig.limits.perTransaction)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm mb-2">Requirements</h4>
                            <ul className="space-y-1">
                                {tierConfig.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Processing time: {tierConfig.processingTime}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requiredDocs.map((docType) => (
                            <DocumentUpload
                                key={docType}
                                type={docType}
                                label={docType.replace(/_/g, ' ')}
                                onUpload={(file) => handleDocumentUpload(docType, file)}
                                uploaded={uploadedDocs.has(docType)}
                            />
                        ))}
                    </div>
                )}

                <DialogFooter>
                    {step === 'info' ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpgrade} disabled={upgradeMutation.isPending}>
                                {upgradeMutation.isPending ? 'Requesting...' : 'Request Upgrade'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setStep('info')}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleComplete}
                                disabled={uploadedDocs.size < requiredDocs.length}
                            >
                                Complete
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
