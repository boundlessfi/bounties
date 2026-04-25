"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  CreditCard,
  Megaphone,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  NotificationItem as NotificationItemType,
  NotificationType,
} from "@/hooks/use-notifications";

function TypeIcon({ type }: { type: NotificationType }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "bounty-updated":
      return <Megaphone className={cn(cls, "text-blue-500")} />;
    case "new-application":
      return <UserPlus className={cn(cls, "text-green-500")} />;
    case "submission-reviewed":
      return <CheckCircle2 className={cn(cls, "text-emerald-500")} />;
    case "dispute-raised":
      return <AlertTriangle className={cn(cls, "text-red-500")} />;
    case "payment-received":
      return <CreditCard className={cn(cls, "text-violet-500")} />;
    case "saved-bounty-updated":
      return <Bookmark className={cn(cls, "text-amber-500")} />;
  }
}

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkRead: (id: string, type: NotificationType) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const handleClick = () => onMarkRead(notification.id, notification.type);

  const body = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        !notification.read && "bg-primary/5",
      )}
    >
      <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1">
        <TypeIcon type={notification.type} />
        {!notification.read && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.timestamp), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={handleClick} className="block">
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {body}
    </button>
  );
}
