"use client";

import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bounty, BountyStatus } from "@/types/bounty";
import { formatDistanceToNow } from "date-fns";

interface BountyCardProps {
  bounty: Bounty;
}

const statusConfig: Record<
  BountyStatus,
  {
    icon: typeof AlertCircle;
    label: string;
    className: string;
    animate?: boolean;
  }
> = {
  OPEN: {
    icon: AlertCircle,
    label: "Open",
    className:
      "bg-success-green/20 text-success-green-darker border-success-green/30",
  },
  IN_PROGRESS: {
    icon: Loader2,
    label: "In Progress",
    className:
      "bg-warning-orange/20 text-warning-orange-darker border-warning-orange/30",
    animate: true,
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: "Completed",
    className: "bg-blue-ish/20 text-blue-ish-darker border-blue-ish/30",
  },
  CANCELLED: {
    icon: AlertCircle,
    label: "Cancelled",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  DRAFT: {
    icon: AlertCircle,
    label: "Draft",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  SUBMITTED: {
    icon: CheckCircle2,
    label: "Submitted",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  UNDER_REVIEW: {
    icon: Loader2,
    label: "Under Review",
    className:
      "bg-warning-orange/20 text-warning-orange-darker border-warning-orange/30",
    animate: true,
  },
  DISPUTED: {
    icon: AlertCircle,
    label: "Disputed",
    className: "bg-red-700/20 text-red-400 border-red-700/30",
  },
};

export function BountyCard({ bounty }: BountyCardProps) {
  const status = statusConfig[bounty.status] || statusConfig.COMPLETED;
  const StatusIcon = status.icon;

  return (
    <div className="block group">
      <Card className="h-full bg-background-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
              {bounty.title}
            </CardTitle>
            <Badge variant="outline" className={`${status.className} shrink-0`}>
              <StatusIcon
                className={`mr-1 h-3 w-3 ${status.animate ? "animate-spin" : ""}`}
              />
              {status.label}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 text-gray-400">
            {bounty.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reward Amount */}
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Reward</div>
                <div className="text-xl font-bold text-primary">
                  {bounty.rewardAmount.toLocaleString()} {bounty.rewardCurrency}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {bounty.type.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(bounty.createdAt, { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Updated{" "}
                {formatDistanceToNow(bounty.updatedAt, { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
