"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Github, DollarSign, Milestone, Trophy } from "lucide-react";
import { Bounty, BountyType, BountyStatus } from "@/types/bounty";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BountyCardProps {
  bounty: Bounty;
}

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
    className: "bg-secondary-500 text-white border-transparent",
  },
  COMPETITION: {
    label: "Competition",
    icon: <Trophy className="size-3" />,
    className: "bg-error-500 text-white border-transparent",
  },
};

const statusColors: Record<BountyStatus, string> = {
  OPEN: "bg-success-500/10 text-success-500 border-success-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  DRAFT: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  SUBMITTED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  UNDER_REVIEW: "bg-warning-500/10 text-warning-500 border-warning-500/20",
  DISPUTED: "bg-red-700/10 text-red-400 border-red-700/20",
};

const statusLabels: Record<BountyStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  DISPUTED: "Disputed",
};

export function BountyCard({ bounty }: BountyCardProps) {
  const defaultTypeInfo = {
    label: bounty.type ?? "Unknown",
    icon: <DollarSign className="size-3" />,
    className: "bg-gray-500 text-white border-transparent",
  };

  const typeInfo = typeConfig[bounty.type as BountyType] ?? defaultTypeInfo;
  const statusColor = statusColors[bounty.status] || statusColors.COMPLETED;
  const statusLabel = statusLabels[bounty.status] || bounty.status;

  const orgName = bounty.organization?.name ?? "Unknown";
  const orgLogo = bounty.organization?.logo;

  // Prevent card click when clicking interactive elements
  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card className="group h-full flex flex-col bg-background-card border-gray-800 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 relative">
      <CardHeader className="p-5 pb-3 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            {orgLogo ? (
              <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-gray-800">
                <Image
                  src={orgLogo}
                  alt={orgName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="size-8 shrink-0 rounded-md bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                {orgName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-300 line-clamp-1">
                {orgName}
              </h3>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                {formatDistanceToNow(new Date(bounty.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Badge
              variant="outline"
              className={cn("shrink-0 gap-1.5", typeInfo.className)}
            >
              {typeInfo.icon}
              {typeInfo.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] px-1.5 py-0 h-5",
                statusColor,
              )}
            >
              {statusLabel}
            </Badge>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          <Link
            href={`/bounty/${bounty.id}`}
            className="focus:outline-none after:absolute after:inset-0"
          >
            {bounty.title}
          </Link>
        </h2>
      </CardHeader>

      <CardContent className="p-5 py-2 grow">
        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
          {
            bounty.description.replace(
              /[#*`_]/g,
              "",
            ) /* Simple stripped markdown preview */
          }
        </p>
      </CardContent>

      <CardFooter className="p-5 pt-3 mt-auto border-t border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Reward
            </span>
            <span className="font-bold text-primary">
              {bounty.rewardAmount} {bounty.rewardCurrency}
            </span>
          </div>
        </div>

        <a
          href={bounty.githubIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative z-10"
          onClick={handleInteractiveClick}
          title="View GitHub Issue"
        >
          <Github className="size-5" />
        </a>
      </CardFooter>
    </Card>
  );
}
