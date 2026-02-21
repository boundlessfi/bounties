import type { ElementType } from "react";
import { User, Users, Trophy } from "lucide-react";
import type { Bounty } from "@/lib/api";

export const STATUS_CONFIG: Record<
  Bounty["status"],
  { label: string; dot: string; className: string }
> = {
  open: {
    label: "Open",
    dot: "bg-emerald-400",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  claimed: {
    label: "Claimed",
    dot: "bg-amber-400",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  closed: {
    label: "Closed",
    dot: "bg-gray-500",
    className: "bg-gray-800/60 text-gray-400 border border-gray-700",
  },
};

export const DIFFICULTY_CONFIG: Record<
  NonNullable<Bounty["difficulty"]>,
  { label: string; className: string }
> = {
  beginner: {
    label: "Beginner",
    className: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  },
  advanced: {
    label: "Advanced",
    className: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  },
};

export const CLAIMING_MODEL_CONFIG: Record<
  Bounty["claimingModel"],
  { label: string; description: string; icon: ElementType }
> = {
  "single-claim": {
    label: "Single Claim",
    description: "One contributor can claim and complete this bounty.",
    icon: User,
  },
  application: {
    label: "Application",
    description:
      "Apply to work on this bounty. Maintainers pick a contributor.",
    icon: Users,
  },
  competition: {
    label: "Competition",
    description: "Multiple contributors submit — best solution wins.",
    icon: Trophy,
  },
  "multi-winner": {
    label: "Multi-Winner",
    description: "Multiple submissions can be rewarded.",
    icon: Users,
  },
};
