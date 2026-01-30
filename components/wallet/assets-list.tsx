"use client";

import { useState } from "react";
import { WalletAsset } from "@/types/wallet";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssetsListProps {
    assets: WalletAsset[];
}

export function AssetsList({ assets }: AssetsListProps) {
    const [search, setSearch] = useState("");
    const [hideSmallBalances, setHideSmallBalances] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        key: 'tokenSymbol' | 'amount' | 'usdValue';
        direction: 'asc' | 'desc';
    }>({ key: 'usdValue', direction: 'desc' });

    const handleSort = (key: 'tokenSymbol' | 'amount' | 'usdValue') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const filteredAndSortedAssets = [...assets]
        .filter(asset => {
            const matchesSearch = asset.tokenName.toLowerCase().includes(search.toLowerCase()) ||
                asset.tokenSymbol.toLowerCase().includes(search.toLowerCase());
            const passesFilter = !hideSmallBalances || asset.usdValue >= 1;
            return matchesSearch && passesFilter;
        })
        .sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            return 0;
        });

    const totalUsd = assets.reduce((acc, c) => acc + c.usdValue, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assets..."
                        className="pl-9 bg-muted/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleSort('tokenSymbol')}
                        title="Sort by Symbol"
                    >
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort Symbol
                    </Button>
                    <Button
                        variant={hideSmallBalances ? "default" : "outline"}
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => setHideSmallBalances(!hideSmallBalances)}
                        title={hideSmallBalances ? "Showing only >$1" : "Filter small balances"}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {hideSmallBalances ? "Filtering" : "Filter"}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Asset</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Balance</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Price</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Value</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px] hidden md:table-cell">Portfolio %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAndSortedAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                        No assets found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-muted/30 transition-colors cursor-pointer group">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-foreground dark:text-primary">
                                                    {asset.tokenSymbol}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{asset.tokenSymbol}</div>
                                                    <div className="text-xs text-muted-foreground">{asset.tokenName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="font-medium">{asset.amount.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">{asset.tokenSymbol}</div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {formatCurrency(asset.amount ? asset.usdValue / asset.amount : 0)}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="font-medium">{formatCurrency(asset.usdValue)}</div>
                                        </td>
                                        <td className="py-4 px-4 text-right hidden md:table-cell">
                                            <div className="text-xs font-medium">
                                                {(totalUsd ? (asset.usdValue / totalUsd) * 100 : 0).toFixed(1)}%
                                            </div>
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
