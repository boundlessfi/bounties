import type { BountyStatus, BountyType } from "@/types/bounty";
import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/bounty-config";

export function StatusBadge({ status }: { status: BountyStatus }) {
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

export function TypeBadge({ type }: { type: BountyType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
