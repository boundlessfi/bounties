import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Zap, Trophy, CheckCircle, AlertCircle } from "lucide-react";

interface CreditExplainerProps {
  className?: string;
}

export function CreditExplainer({ className }: CreditExplainerProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 fill-current text-yellow-500" />
          About Spark Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        <p className="text-sm text-muted-foreground">
          Spark Credits are application credits that prevent spam while ensuring
          quality contributors always have opportunities.
        </p>

        {/* How to earn */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-yellow-500" />
            How to Earn Credits
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-green-500" />
              <span>Complete a bounty — earn 1 credit per completion</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-green-500" />
              <span>Win a competition bounty — earn bonus credits</span>
            </li>
          </ul>
        </div>

        {/* Costs */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-yellow-500" />
            Credit Costs
          </h4>
          <div className="rounded-lg border border-border/50 divide-y divide-border/50">
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">Claim a FCFS bounty</span>
              <span className="flex items-center gap-1 font-medium">
                <Zap className="h-3.5 w-3.5 fill-current text-yellow-500" />1
                credit
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">Enter a competition</span>
              <span className="text-muted-foreground text-xs italic">Free</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Tips
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-center text-xs font-bold text-blue-500">
                •
              </span>
              <span>
                Complete bounties before claiming new ones to keep your credit
                balance healthy.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-center text-xs font-bold text-blue-500">
                •
              </span>
              <span>
                Your credit balance is shown in the navbar so you always know
                your current standing.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-center text-xs font-bold text-blue-500">
                •
              </span>
              <span>
                Credits cannot be purchased — they can only be earned through
                contributions.
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
