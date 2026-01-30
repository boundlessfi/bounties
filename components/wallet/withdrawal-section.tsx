"use client";

import { useState } from "react";
import { WalletInfo } from "@/types/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Plus, ArrowRight, History, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface WithdrawalSectionProps {
    walletInfo: WalletInfo;
}

export function WithdrawalSection({ walletInfo }: WithdrawalSectionProps) {
    const [amount, setAmount] = useState("");

    // Mock bank accounts
    const bankAccounts = [
        { id: '1', name: 'Chase Bank', last4: '4242', isPrimary: true },
    ];

    const parsedAmount = parseFloat(amount);
    const isValidAmount = !isNaN(parsedAmount) &&
        isFinite(parsedAmount) &&
        parsedAmount >= 10 &&
        parsedAmount <= walletInfo.balance;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Off-Ramp to Fiat</h3>
                    <p className="text-sm text-muted-foreground">
                        Withdraw your crypto earnings directly to your bank account via our secure payment partners.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Withdrawal Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
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
                        </div>

                        <div className="space-y-2">
                            <Label>Select Destination</Label>
                            <div className="space-y-2">
                                {bankAccounts.map((account) => (
                                    <div key={account.id} className="flex items-center justify-between p-3 rounded-xl border border-primary bg-primary/5 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <Building className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{account.name}</div>
                                                <div className="text-xs text-muted-foreground">Ending in {account.last4}</div>
                                            </div>
                                        </div>
                                        {account.isPrimary && <Badge className="text-[10px] h-5">Primary</Badge>}
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full border-dashed border-2 py-6 text-sm flex gap-2">
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
                                <span className="text-foreground">$2.50</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold text-foreground">
                                <span>You&apos;ll Receive</span>
                                <span>{formatCurrency(Math.max(0, (parsedAmount || 0) - 2.50))}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-md font-semibold"
                            disabled={!isValidAmount}
                            onClick={() => {
                                if (isValidAmount) {
                                    // Handle withdrawal
                                }
                            }}
                        >
                            Complete Withdrawal
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-border p-6 bg-card space-y-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary-foreground dark:text-primary" />
                            <h4 className="font-semibold text-sm uppercase tracking-wider">Withdrawal History</h4>
                        </div>

                        <div className="space-y-3">
                            {/* Empty state or items */}
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                                <History className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-sm font-medium">No recent withdrawals</p>
                                <p className="text-xs text-muted-foreground">Your payout history will appear here.</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Limits & Settings</h4>
                            </div>
                            <div className="grid gap-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Daily Limit</span>
                                    <span className="font-medium">$5,000 / $5,000</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                    <div className="bg-primary h-1.5 rounded-full w-[0%]"></div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Monthly Limit</span>
                                    <span className="font-medium">$50,000 / $50,000</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                    <div className="bg-primary h-1.5 rounded-full w-[0%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
