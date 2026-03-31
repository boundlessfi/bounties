"use client";

import { useEscrowPool, useEscrowSlots } from "@/hooks/use-escrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EscrowStatus } from "./escrow-status";
import {
  ShieldCheck,
  ExternalLink,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EscrowDetailPanelProps {
  poolId: string;
}

export function EscrowDetailPanel({ poolId }: EscrowDetailPanelProps) {
  const {
    data: pool,
    isLoading: poolLoading,
    isError: poolError,
  } = useEscrowPool(poolId);
  const { data: slots, isLoading: slotsLoading } = useEscrowSlots(poolId);

  if (poolLoading || slotsLoading) {
    return (
      <Card className="border-border/50 bg-background-card">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading Escrow Data...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (poolError || !pool) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center justify-center py-10 text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm border-0 font-medium">
            Failed to load Escrow Data
          </span>
        </CardContent>
      </Card>
    );
  }

  const lockedAmount =
    pool.status === "Fully Released"
      ? 0
      : pool.totalAmount - pool.releasedAmount;

  return (
    <Card className="border-border/50 bg-background-card overflow-hidden">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Escrow Vault</CardTitle>
          </div>
          <EscrowStatus
            status={pool.status}
            lockedAmount={lockedAmount}
            releasedAmount={pool.releasedAmount}
            currency={pool.asset}
            showAmounts={true}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b">
          <div className="p-5 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">
              Total Escrowed
            </span>
            <div className="text-2xl font-bold flex items-baseline gap-1">
              {pool.totalAmount.toLocaleString()}
              <span className="text-sm font-medium text-muted-foreground">
                {pool.asset}
              </span>
            </div>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">
              Currently Locked
            </span>
            <div className="text-2xl font-bold flex items-baseline gap-1">
              {lockedAmount.toLocaleString()}
              <span className="text-sm font-medium text-muted-foreground">
                {pool.asset}
              </span>
            </div>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-semibold mb-1">
              Expiry Date
            </span>
            <div className="text-md font-medium flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {pool.expiry ? format(new Date(pool.expiry), "PPP") : "No Expiry"}
            </div>
          </div>
        </div>

        {slots && slots.length > 0 && (
          <div className="p-5">
            <h4 className="text-sm font-semibold mb-4">Release Slots</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[100px]">Slot</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.index}>
                      <TableCell className="font-medium">
                        #{slot.index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {slot.recipientAddress}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {slot.amount.toLocaleString()} {pool.asset}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            slot.status === "Released" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {slot.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="p-4 bg-muted/20 border-t flex justify-end">
          <a
            href={`https://stellar.expert/explorer/testnet/account/escrow_mock_${poolId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View on Stellar Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
