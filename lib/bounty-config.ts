import type { BountyStatus, BountyType } from "@/types/bounty";

export const STATUS_CONFIG: Record<
  BountyStatus,
  { label: string; dot: string; className: string }
> = {
  OPEN: {
    label: "Open",
    dot: "bg-emerald-400",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-blue-400",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-gray-500",
    className: "bg-gray-800/60 text-gray-400 border border-gray-700",
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-red-500",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
  DRAFT: {
    label: "Draft",
    dot: "bg-gray-400",
    className: "bg-gray-800/60 text-gray-400 border border-gray-700",
  },
  SUBMITTED: {
    label: "Submitted",
    dot: "bg-yellow-400",
    className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    dot: "bg-amber-400",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  DISPUTED: {
    label: "Disputed",
    dot: "bg-red-600",
    className: "bg-red-700/10 text-red-400 border border-red-700/20",
  },
};

export const TYPE_CONFIG: Record<
  BountyType,
  { label: string; className: string }
> = {
  FIXED_PRICE: {
    label: "Fixed Price",
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  MILESTONE_BASED: {
    label: "Milestone",
    className: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  },
  COMPETITION: {
    label: "Competition",
    className: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  },
};
