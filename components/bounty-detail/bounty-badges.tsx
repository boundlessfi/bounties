import { STATUS_CONFIG, TYPE_CONFIG } from "@/lib/bounty-config";

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type?: string;
}) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.COMPLETED;
  const isClaimed = type === "FIXED_PRICE" && status === "IN_PROGRESS";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.className}`}
    >
      <span className={`size-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {isClaimed ? "Claimed" : cfg.label}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.FIXED_PRICE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
