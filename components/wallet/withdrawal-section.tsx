"use client";

import { useState, useEffect, useMemo } from "react";
import { WalletInfo } from "@/types/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  Plus,
  ArrowRight,
  History,
  Info,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LimitsDisplay } from "@/components/compliance/limits-display";
import { TermsDialog } from "@/components/compliance/terms-dialog";
import { TierUpgradeDialog } from "@/components/compliance/tier-upgrade-dialog";
import { HoldMessage } from "@/components/compliance/hold-message";
import { useComplianceStatus } from "@/hooks/use-compliance";
import {
  useValidateWithdrawal,
  useSubmitWithdrawal,
} from "@/hooks/use-withdrawal";
import { toast } from "sonner";

interface WithdrawalSectionProps {
  walletInfo: WalletInfo;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function WithdrawalSection({ walletInfo }: WithdrawalSectionProps) {
  const [amount, setAmount] = useState("");
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: complianceData } = useComplianceStatus();
  const validateMutation = useValidateWithdrawal();
  const submitMutation = useSubmitWithdrawal();

  const { mutate: validate } = validateMutation;

  // TODO: Replace with real bank accounts from a service/hook
  const bankAccounts: {
    id: string;
    name: string;
    last4: string;
    isPrimary: boolean;
  }[] = [];

  const parsedAmount = isNaN(parseFloat(amount)) ? 0 : parseFloat(amount);
  const isValidAmount = isFinite(parsedAmount) && parsedAmount >= 10;

  const syncValidationError = useMemo(() => {
    if (!amount || Number.isNaN(parsedAmount)) return null;
    if (!isValidAmount) return "Minimum withdrawal is $10.00";
    if (parsedAmount > walletInfo.balance) return "Insufficient balance";
    return null;
  }, [amount, isValidAmount, parsedAmount, walletInfo.balance]);

  useEffect(() => {
    // If we have a sync error, we don't need to run async validation.
    // The UI will prefer syncValidationError automatically.
    if (syncValidationError) {
      return;
    }

    if (parsedAmount <= 0) return;

    const debounceTimer = setTimeout(() => {
      validate(parsedAmount, {
        onSuccess: (result) => {
          if (!result.valid) {
            setValidationError(result.errors[0] || "Validation failed");
          } else {
            setValidationError(null);
          }
        },
      });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [syncValidationError, validate, parsedAmount]);

  const handleWithdraw = async () => {
    if (!canWithdraw || !complianceData || bankAccounts.length === 0) return;

    try {
      await submitMutation.mutateAsync({
        amount: parsedAmount,
        currency: "USD",
        destinationId: bankAccounts[0].id,
      });
      toast.success("Withdrawal submitted successfully!");
      setAmount("");
    } catch {
      toast.error("Withdrawal failed. Please try again.");
    }
  };

  const isAmountValidated =
    validateMutation.isSuccess && validateMutation.variables === parsedAmount;

  const serverFee = validateMutation.data?.valid ? 2.5 : 2.5; // TODO: Use real fee from server when available

  const canWithdraw =
    isValidAmount &&
    parsedAmount <= walletInfo.balance &&
    !validationError &&
    !syncValidationError &&
    !validateMutation.isPending &&
    isAmountValidated &&
    bankAccounts.length > 0 &&
    complianceData?.compliance.holdState === "NONE" &&
    !complianceData?.termsStatus.requiresAcceptance;

  return (
    <div className="space-y-6">
      {complianceData && (
        <>
          <HoldMessage
            holdState={complianceData.compliance.holdState}
            reason={complianceData.compliance.holdReason}
          />

          <TermsDialog
            open={showTermsDialog}
            onOpenChange={setShowTermsDialog}
            onAccepted={() => {
              setShowTermsDialog(false);
            }}
          />

          {complianceData.nextTier && (
            <TierUpgradeDialog
              open={showUpgradeDialog}
              onOpenChange={setShowUpgradeDialog}
              currentTier={complianceData.compliance.currentTier}
              targetTier={complianceData.nextTier}
            />
          )}
        </>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Off-Ramp to Fiat</h3>
          <p className="text-sm text-muted-foreground">
            Withdraw your crypto earnings directly to your bank account via our
            secure payment partners.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-7 bg-muted/30 h-12 text-lg font-semibold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                  variant="link"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs h-auto p-0 px-2"
                  onClick={() => setAmount(walletInfo.balance.toString())}
                >
                  MAX
                </Button>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Balance: {formatCurrency(walletInfo.balance)}</span>
                <span>Min: $10.00</span>
              </div>
              {(syncValidationError || validationError) && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {syncValidationError || validationError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label>Select Destination</Label>
              <div className="space-y-2">
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-primary bg-primary/5 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {account.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ending in {account.last4}
                          </div>
                        </div>
                      </div>
                      {account.isPrimary && (
                        <Badge className="text-[10px] h-5">Primary</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 border border-dashed rounded-xl text-center text-sm text-muted-foreground">
                    No bank accounts linked
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 py-6 text-sm flex gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Bank Account
                </Button>
              </div>
            </div>

            <div className="rounded-xl bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Exchange Rate (Est)</span>
                <span className="text-foreground">1 USDC = $1.00 USD</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee</span>
                <span className="text-foreground">
                  {formatCurrency(serverFee)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-foreground">
                <span>You&apos;ll Receive</span>
                <span>
                  {formatCurrency(Math.max(0, (parsedAmount || 0) - serverFee))}
                </span>
              </div>
            </div>

            {complianceData?.termsStatus.requiresAcceptance && (
              <Button
                className="w-full h-12 text-md font-semibold"
                variant="secondary"
                onClick={() => setShowTermsDialog(true)}
              >
                Accept Terms & Conditions
              </Button>
            )}

            <Button
              className="w-full h-12 text-md font-semibold"
              disabled={!canWithdraw || submitMutation.isPending}
              onClick={handleWithdraw}
            >
              {submitMutation.isPending
                ? "Processing..."
                : "Complete Withdrawal"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border p-6 bg-card space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary-foreground dark:text-primary" />
              <h4 className="font-semibold text-sm uppercase tracking-wider">
                Withdrawal History
              </h4>
            </div>

            <div className="space-y-3">
              {/* Empty state or items */}
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <History className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm font-medium">No recent withdrawals</p>
                <p className="text-xs text-muted-foreground">
                  Your payout history will appear here.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Limits & Settings
                </h4>
              </div>
              <LimitsDisplay
                onUpgradeClick={() => setShowUpgradeDialog(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
