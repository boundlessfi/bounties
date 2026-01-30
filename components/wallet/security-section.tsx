"use client";

import { WalletInfo } from "@/types/wallet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Key, CircleAlert, CheckCircle2, ListFilter, MonitorPlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SecuritySectionProps {
    walletInfo: WalletInfo;
}

export function SecuritySection({ walletInfo }: SecuritySectionProps) {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Security Settings</h3>
                        <p className="text-sm text-muted-foreground">Manage how your wallet and funds are protected.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Smartphone className="h-5 w-5 text-primary-foreground dark:text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Two-Factor Authentication</div>
                                    <div className="text-xs text-muted-foreground">Use an authenticator app for withdrawals</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={walletInfo.has2FA ? "outline" : "secondary"} className={walletInfo.has2FA ? "text-green-500 border-green-500/20 bg-green-500/5" : ""}>
                                    {walletInfo.has2FA ? "Enabled" : "Disabled"}
                                </Badge>
                                <Switch checked={walletInfo.has2FA} disabled />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <ListFilter className="h-5 w-5 text-primary-foreground dark:text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Withdrawal Whitelist</div>
                                    <div className="text-xs text-muted-foreground">Only allow withdrawals to verified addresses</div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Manage</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Key className="h-5 w-5 text-primary-foreground dark:text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Transaction Signing</div>
                                    <div className="text-xs text-muted-foreground">Require approval for large movements</div>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Active Sessions</h3>
                        <p className="text-sm text-muted-foreground">Devices currently logged into your wallet.</p>
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="bg-card p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MonitorPlay className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium">This Computer</div>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">Current</Badge>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <div className="text-muted-foreground mb-1">Browser</div>
                                    <div>Chrome on macOS</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">IP Address</div>
                                    <div>192.168.1.1</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Location</div>
                                    <div>San Francisco, CA</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Last Active</div>
                                    <div>Just now</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-500/5">
                                Log out of all sessions
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3 shadow-inner">
                        <CheckCircle2 className="h-5 w-5 text-primary-foreground dark:text-primary shrink-0" />
                        <div>
                            <div className="text-sm font-semibold">Security Score: 85/100</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Your account is well protected. Add 2FA to reach 100.</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Recent Security Activity</h3>
                    <Button variant="link" className="text-xs h-auto p-0">View Full Log</Button>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="flex-1">Successful login from new device</span>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="flex-1">Password successfully changed</span>
                        <span className="text-xs text-muted-foreground">3 days ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-red-500">
                        <CircleAlert className="h-4 w-4" />
                        <span className="flex-1">Failed login attempt (mismatched password)</span>
                        <span className="text-xs text-muted-foreground">5 days ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
