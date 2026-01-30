"use client";

import { useState } from "react";
import { WalletActivity } from "@/types/wallet";
import { Input } from "@/components/ui/input";
import { Search, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TransactionHistoryProps {
    activity: WalletActivity[];
}

export function TransactionHistory({ activity }: TransactionHistoryProps) {
    const [search, setSearch] = useState("");

    const formatSafeDate = (dateString: string, formatString: string) => {
        const date = new Date(dateString);
        return isValid(date) ? format(date, formatString) : "—";
    };

    const filteredActivity = activity.filter(item =>
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.currency.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (amount: number, currency: string) => {
        if (currency === "USD" || currency === "USDC") {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount);
        }
        return `${amount.toLocaleString()} ${currency}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const handleExportCsv = () => {
        const headers = ["ID", "Type", "Description", "Amount", "Currency", "Date", "Status"];
        const rows = filteredActivity.map(item => [
            item.id,
            item.type,
            item.description || "",
            item.amount.toString(),
            item.currency,
            format(new Date(item.date), 'yyyy-MM-dd HH:mm:ss'),
            item.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => {
                // Sanitize to prevent CSV injection
                const sanitized = cell.replace(/"/g, '""');
                return /^[=+\-@]/.test(sanitized) ? `"'${sanitized}"` : `"${sanitized}"`;
            }).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${formatSafeDate(new Date().toISOString(), 'yyyyMMdd_HHmm')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-9 bg-muted/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search transactions"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={handleExportCsv}
                        disabled={filteredActivity.length === 0}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Type</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Description</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Amount</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Date</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredActivity.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                        No activity found.
                                    </td>
                                </tr>
                            ) : (
                                filteredActivity.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-full ${item.type === 'earning' ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                                                    {item.type === 'earning' ? (
                                                        <ArrowDownLeft className={`h-4 w-4 ${item.type === 'earning' ? 'text-green-500' : 'text-orange-500'}`} />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4 text-orange-500" />
                                                    )}
                                                </div>
                                                <span className="capitalize font-medium">{item.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 max-w-[200px] truncate">
                                            {item.description || 'No description'}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className={`font-semibold ${item.type === 'earning' ? 'text-green-500' : ''}`}>
                                                {item.type === 'earning' ? '+' : '-'} {formatCurrency(item.amount, item.currency)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right text-muted-foreground">
                                            {formatSafeDate(item.date, 'MMM d, yyyy')}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0 h-5 ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
