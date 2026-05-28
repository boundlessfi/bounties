"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  RefreshCw,
  UserPlus,
  FileCheck,
  Bookmark,
  AlertTriangle,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { NotificationItem as NotificationItemData } from "@/hooks/use-notifications";

const iconMap: Record<NotificationItemData["type"], LucideIcon> = {
  "bounty-updated": RefreshCw,
  "new-application": UserPlus,
  "submission-reviewed": FileCheck,
  "saved-bounty-updated": Bookmark,
  "dispute-raised": AlertTriangle,
  "payment-received": Wallet,
};

const colorMap: Record<NotificationItemData["type"], string> = {
  "bounty-updated": "text-blue-500",
  "new-application": "text-emerald-500",
  "submission-reviewed": "text-violet-500",
  "saved-bounty-updated": "text-amber-500",
  "dispute-raised": "text-red-500",
  "payment-received": "text-green-500",
};

interface NotificationItemProps {
  notification: NotificationItemData;
  onRead: (id: string, type: NotificationItemData["type"]) => void;
  onClose?: () => void;
}

export function NotificationItem({
  notification,
  onRead,
  onClose,
}: NotificationItemProps) {
  const router = useRouter();
  const Icon = iconMap[notification.type];
  const iconColor = colorMap[notification.type];

  const handleClick = () => {
    onRead(notification.id, notification.type);

    if (notification.resourceUrl) {
      router.push(notification.resourceUrl);
      onClose?.();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        !notification.read && "bg-primary/5",
      )}
    >
      {/* Unread dot */}
      <span
        className={cn(
          "mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full",
          notification.read ? "bg-transparent" : "bg-primary",
        )}
        aria-hidden="true"
      />

      {/* Type icon */}
      <span className={cn("mt-0.5 shrink-0", iconColor)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="text-sm text-foreground leading-snug">
          {notification.message}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.timestamp), {
            addSuffix: true,
          })}
        </div>
      </div>
    </button>
  );
}
