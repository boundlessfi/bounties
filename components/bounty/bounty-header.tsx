import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Bounty, BountyType, BountyStatus } from "@/types/bounty";
import { DollarSign, Milestone, Trophy } from "lucide-react";

const typeConfig: Record<
  BountyType,
  { label: string; icon: React.ReactNode; className: string }
> = {
  FIXED_PRICE: {
    label: "Fixed Price",
    icon: <DollarSign className="size-3" />,
    className: "bg-primary text-primary-foreground border-transparent",
  },
  MILESTONE_BASED: {
    label: "Milestone",
    icon: <Milestone className="size-3" />,
    className: "bg-gray-700 text-gray-100 border-transparent",
  },
  COMPETITION: {
    label: "Competition",
    icon: <Trophy className="size-3" />,
    className: "bg-destructive text-white border-transparent",
  },
};

const statusConfig: Record<BountyStatus, { label: string; className: string }> =
  {
    OPEN: {
      label: "Open",
      className: "bg-green-500 text-white border-transparent",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-blue-500 text-white border-transparent",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-gray-700 text-gray-300 border-transparent",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-red-700 text-gray-200 border-transparent",
    },
    DRAFT: {
      label: "Draft",
      className: "bg-gray-600 text-gray-300 border-transparent",
    },
    SUBMITTED: {
      label: "Submitted",
      className: "bg-yellow-500 text-white border-transparent",
    },
    UNDER_REVIEW: {
      label: "Under Review",
      className: "bg-orange-500 text-white border-transparent",
    },
    DISPUTED: {
      label: "Disputed",
      className: "bg-red-500 text-white border-transparent",
    },
  };

interface BountyHeaderProps {
  bounty: Bounty;
}

export function BountyHeader({ bounty }: BountyHeaderProps) {
  const typeInfo = typeConfig[bounty.type];
  const statusInfo = statusConfig[bounty.status];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge className={typeInfo.className}>
          {typeInfo.icon}
          {typeInfo.label}
        </Badge>
        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
          {bounty.title}
        </h1>

        <div className="flex items-center gap-3">
          {bounty.organization?.logo ? (
            <div className="relative size-6 shrink-0 overflow-hidden rounded bg-black">
              <Image
                src={bounty.organization.logo}
                alt={bounty.organization.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="size-6 shrink-0 rounded bg-black flex items-center justify-center text-[10px] font-bold text-gray-400">
              {(bounty.organization?.name ?? "??")
                .substring(0, 2)
                .toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium">
            {bounty.organization?.name ?? "Unknown"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest">
            Reward
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-primary tabular-nums tracking-tight">
              {bounty.rewardAmount.toLocaleString()}
            </span>
            <span className="text-sm font-medium">{bounty.rewardCurrency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
