import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EscrowPoolStatus } from "@/types/escrow";
import { ShieldAlert, ShieldCheck, ShieldHalf, RotateCcw } from "lucide-react";

interface EscrowStatusProps {
  status: EscrowPoolStatus;
  lockedAmount?: number;
  releasedAmount?: number;
  currency?: string;
  className?: string;
  showAmounts?: boolean;
}

const config: Record<
  EscrowPoolStatus,
  {
    variant: "default" | "secondary" | "outline" | "destructive";
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
  }
> = {
  Escrowed: {
    variant: "default",
    icon: ShieldCheck,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
  },
  "Partially Released": {
    variant: "secondary",
    icon: ShieldHalf,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10 border-blue-500/20",
  },
  "Fully Released": {
    variant: "outline",
    icon: ShieldAlert, // Representing empty shield/released
    colorClass: "text-slate-400",
    bgClass: "bg-slate-400/10 border-slate-400/20",
  },
  Refunded: {
    variant: "destructive",
    icon: RotateCcw,
    colorClass: "text-red-500",
    bgClass: "bg-red-500/10 border-red-500/20",
  },
};

export function EscrowStatus({
  status,
  lockedAmount,
  releasedAmount,
  currency = "USDC",
  className,
  showAmounts = false,
}: EscrowStatusProps) {
  const { icon: Icon, colorClass, bgClass, variant } = config[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant={variant}
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 border",
          variant === "default" && bgClass,
          variant === "default" && colorClass,
        )}
      >
        <Icon className={cn("h-3 w-3", colorClass)} />
        {status}
      </Badge>

      {showAmounts && lockedAmount !== undefined && (
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 border-l pl-2 border-border/50">
          <span>
            <strong className="text-foreground">
              {lockedAmount.toLocaleString()}
            </strong>{" "}
            locked
          </span>
          {releasedAmount !== undefined && releasedAmount > 0 && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>
                <strong className="text-foreground">
                  {releasedAmount.toLocaleString()}
                </strong>{" "}
                released
              </span>
            </>
          )}
          <span className="text-muted-foreground/70">{currency}</span>
        </div>
      )}
    </div>
  );
}
