"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WalletAsset } from "@/types/wallet";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUpDown,
  Filter,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSupportedAssets, fetchAssetBalance } from "@/lib/stellar/assets";
import { walletKeys } from "@/hooks/use-wallet-data";
import { toast } from "sonner";

interface AssetsListProps {
  assets: WalletAsset[];
  walletAddress?: string | null;
}

export function AssetsList({ assets, walletAddress }: AssetsListProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: "tokenSymbol" | "amount" | "usdValue";
    direction: "asc" | "desc";
  }>({ key: "usdValue", direction: "desc" });
  const [showManage, setShowManage] = useState(false);
  const [addingAsset, setAddingAsset] = useState<string | null>(null);

  const supportedAssets = getSupportedAssets();
  const activeSymbols = new Set(assets.map((a) => a.tokenSymbol));

  const handleSort = (key: "tokenSymbol" | "amount" | "usdValue") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleRefreshAsset = async (assetId: string) => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }
    const supported = supportedAssets.find((a) => a.id === assetId);
    if (!supported) return;

    setAddingAsset(assetId);
    try {
      await fetchAssetBalance(walletAddress, supported.asset);
      await queryClient.invalidateQueries({
        queryKey: walletKeys.assets(walletAddress),
      });
      toast.success(`${supported.symbol} balance refreshed`);
    } catch (err) {
      console.error("[stellar] refreshAssetBalance failed:", err);
      toast.error(`Failed to refresh ${supported.symbol}`);
    } finally {
      setAddingAsset(null);
    }
  };

  const filteredAndSortedAssets = [...assets]
    .filter((asset) => {
      const matchesSearch =
        asset.tokenName.toLowerCase().includes(search.toLowerCase()) ||
        asset.tokenSymbol.toLowerCase().includes(search.toLowerCase());
      const passesFilter = !hideSmallBalances || asset.usdValue >= 1;
      return matchesSearch && passesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
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
            onClick={() => handleSort("tokenSymbol")}
            title="Sort by Symbol"
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort
          </Button>
          <Button
            variant={hideSmallBalances ? "default" : "outline"}
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {hideSmallBalances ? "Filtering" : "Filter"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setShowManage(!showManage)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Asset
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Balance
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Price
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Value
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-[10px] hidden md:table-cell">
                  Portfolio %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-foreground dark:text-primary">
                          {asset.tokenSymbol}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {asset.tokenSymbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {asset.tokenName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">
                        {asset.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {asset.tokenSymbol}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(
                        asset.amount ? asset.usdValue / asset.amount : 0,
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium">
                        {formatCurrency(asset.usdValue)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right hidden md:table-cell">
                      <div className="text-xs font-medium">
                        {(totalUsd
                          ? (asset.usdValue / totalUsd) * 100
                          : 0
                        ).toFixed(1)}
                        %
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showManage && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h4 className="font-semibold text-sm">Supported Assets</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assets supported by this platform. Use Refresh to update the
              balance of an asset already held in your wallet.
            </p>
          </div>
          <Separator />
          <div className="space-y-3">
            {supportedAssets.map((supported) => {
              const isActive = activeSymbols.has(supported.symbol);
              const isAdding = addingAsset === supported.id;
              return (
                <div
                  key={supported.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-foreground dark:text-primary">
                      {supported.symbol}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {supported.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {supported.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <Badge
                        variant="outline"
                        className="text-green-500 border-green-500/20 bg-green-500/5 text-[10px] h-5"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={isAdding || !walletAddress}
                        onClick={() => handleRefreshAsset(supported.id)}
                      >
                        {isAdding ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        Refresh
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
