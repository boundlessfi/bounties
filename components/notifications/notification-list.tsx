"use client";

import { isToday, isYesterday } from "date-fns";
import { CheckCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import type {
  NotificationItem as NotificationItemData,
  NotificationType,
} from "@/hooks/use-notifications";
import { NotificationItem } from "./notification-item";

interface NotificationListProps {
  notifications: NotificationItemData[];
  isLoading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: string, type: NotificationType) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onClose?: () => void;
}

interface DateGroup {
  label: string;
  items: NotificationItemData[];
}

function groupByDate(items: NotificationItemData[]): DateGroup[] {
  const today: NotificationItemData[] = [];
  const yesterday: NotificationItemData[] = [];
  const earlier: NotificationItemData[] = [];

  for (const item of items) {
    const date = new Date(item.timestamp);
    if (isToday(date)) {
      today.push(item);
    } else if (isYesterday(date)) {
      yesterday.push(item);
    } else {
      earlier.push(item);
    }
  }

  const groups: DateGroup[] = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (yesterday.length > 0)
    groups.push({ label: "Yesterday", items: yesterday });
  if (earlier.length > 0) groups.push({ label: "Earlier", items: earlier });

  return groups;
}

export function NotificationList({
  notifications,
  isLoading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onClose,
}: NotificationListProps) {
  const groups = groupByDate(notifications);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Notifications</div>
          <div className="text-xs text-muted-foreground">
            Real-time bounty and application activity.
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Read all</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
            onClick={onClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="max-h-[28rem]">
        {isLoading ? (
          <div className="space-y-3 px-4 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No notifications yet. New activity will appear here instantly.
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div key={group.label}>
                <div className="sticky top-0 z-10 bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  {group.label}
                </div>
                <div className="divide-y">
                  {group.items.map((notification) => (
                    <NotificationItem
                      key={`${notification.type}:${notification.id}`}
                      notification={notification}
                      onRead={onMarkAsRead}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
