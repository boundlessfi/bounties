"use client";

import { useState } from "react";
import { useFeeCalculation } from "@/hooks/use-escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function FeeCalculator() {
  const [amountInput, setAmountInput] = useState<string>("1000");
  const [subType, setSubType] = useState<string>("FIXED_PRICE");

  // Debounce the input to avoid spamming the calculation
  const debouncedAmountStr = useDebounce(amountInput, 500);
  const amount = Number(debouncedAmountStr) || 0;

  const { data: feeDetails, isLoading } = useFeeCalculation(amount, subType);

  return (
    <Card className="border-border/50 bg-background-card">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Fee Estimator</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="amount" className="text-xs text-muted-foreground">
              Bounty Amount (USDC)
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="h-8 text-sm placeholder:text-muted-foreground/50"
              placeholder="e.g. 1000"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="type" className="text-xs text-muted-foreground">
              Bounty Type
            </Label>
            <Select value={subType} onValueChange={setSubType}>
              <SelectTrigger id="type" className="h-8 text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                <SelectItem value="MILESTONE_BASED">Milestone Based</SelectItem>
                <SelectItem value="COMPETITION">Competition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md bg-muted/30 p-3 pt-4 border space-y-2 mt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Gross Amount:</span>
            <span className="font-medium">${amount.toLocaleString()}</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : feeDetails ? (
            <>
              <div className="flex justify-between items-center text-xs text-destructive/80">
                <span>Platform Fee:</span>
                <span>-${feeDetails.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-destructive/80 pb-2 border-b border-border/50">
                <span>Insurance Fee:</span>
                <span>-${feeDetails.insuranceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-semibold">Net Payout:</span>
                <span className="text-sm font-bold text-emerald-500">
                  ${feeDetails.netPayout.toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-muted-foreground py-2">
              Enter a valid amount
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
