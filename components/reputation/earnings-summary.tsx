import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/helpers/format.helper";
import { TrendingUp, Clock } from "lucide-react";

export type EarningsSummary = {
  totalEarned: number;
  pendingAmount: number;
  currency: string;
  payoutHistory: Array<{
    amount: number;
    date: string;
    status: "processing" | "completed";
  }>;
};

interface EarningsSummaryProps {
  earnings: EarningsSummary;
}

export function EarningsSummary({ earnings }: EarningsSummaryProps) {
  const currencySymbol = earnings.currency;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">
              {formatCurrency(earnings.totalEarned, currencySymbol)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">
              {formatCurrency(earnings.pendingAmount, currencySymbol)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-base">Payout History</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {earnings.payoutHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payouts yet.</p>
          ) : (
            <div className="space-y-2">
              {earnings.payoutHistory.map((payout, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        payout.status === "completed" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {payout.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(payout.date, "long")}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(payout.amount, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
