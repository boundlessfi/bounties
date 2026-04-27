"use client";

import type {
  NotificationItem as NotificationItemType,
  NotificationType,
} from "@/hooks/use-notifications";
import { NotificationItem } from "./notification-item";

type DateGroup = "Today" | "Yesterday" | "Earlier";

function getGroup(timestamp: string): DateGroup {
  const now = new Date();
  const date = new Date(timestamp);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  if (date >= todayStart) return "Today";
  if (date >= yesterdayStart) return "Yesterday";
  return "Earlier";
}

function groupItems(
  items: NotificationItemType[],
): [DateGroup, NotificationItemType[]][] {
  const groups: Record<DateGroup, NotificationItemType[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };
  for (const item of items) {
    groups[getGroup(item.timestamp)].push(item);
  }
  return (["Today", "Yesterday", "Earlier"] as DateGroup[])
    .filter((g) => groups[g].length > 0)
    .map((g) => [g, groups[g]]);
}

interface NotificationListProps {
  notifications: NotificationItemType[];
  onMarkRead: (id: string, type: NotificationType) => void;
}

export function NotificationList({
  notifications,
  onMarkRead,
}: NotificationListProps) {
  const groups = groupItems(notifications);

  return (
    <div className="divide-y">
      {groups.map(([label, items]) => (
        <div key={label}>
          <p className="sticky top-0 bg-popover px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {items.map((n) => (
            <NotificationItem
              key={`${n.type}:${n.id}`}
              notification={n}
              onMarkRead={onMarkRead}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
