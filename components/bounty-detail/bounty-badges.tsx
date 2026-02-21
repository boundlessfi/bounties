import { Zap } from "lucide-react";
import type { Bounty } from "@/lib/api";
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from "@/lib/bounty-config";

export function StatusBadge({ status }: { status: Bounty["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.className}`}
    >
      <span className={`size-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: NonNullable<Bounty["difficulty"]>;
}) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cfg.className}`}
    >
      <Zap className="size-3" />
      {cfg.label}
    </span>
  );
}
